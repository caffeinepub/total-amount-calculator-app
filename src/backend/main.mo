import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    billPrintLocation : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public type Product = {
    id : Text;
    name : Text;
    _data : {
      price : Nat64;
      quantity : Nat;
      vat : Nat;
    };
  };

  public type DailyTotal = {
    date : Text;
    totalRevenue : Nat64;
    productQuantities : Map.Map<Text, Nat>;
  };

  public type DailyTotalView = {
    date : Text;
    totalRevenue : Nat64;
    productQuantities : [(Text, Nat)];
  };

  // Key format: "principal:date" to ensure per-user isolation
  let dailyTotals = Map.empty<Text, DailyTotal>();

  private func makeKey(user : Principal, date : Text) : Text {
    user.toText() # ":" # date;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func saveDailyTotal(date : Text, totalRevenue : Nat64, productQuantities : [(Text, Nat)]) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save daily totals");
    };

    let productQuantitiesMap = Map.fromIter<Text, Nat>(productQuantities.values());
    let dailyTotal : DailyTotal = {
      date;
      totalRevenue;
      productQuantities = productQuantitiesMap;
    };

    // Store with user-specific key to ensure isolation
    let key = makeKey(caller, date);
    dailyTotals.add(key, dailyTotal);
  };

  func toImmutable(dailyTotal : DailyTotal) : DailyTotalView {
    {
      date = dailyTotal.date;
      totalRevenue = dailyTotal.totalRevenue;
      productQuantities = dailyTotal.productQuantities.toArray();
    };
  };

  public query ({ caller }) func getDailyTotal(date : Text) : async ?DailyTotalView {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can fetch daily totals");
    };

    // Only return the caller's own daily total for the given date
    let key = makeKey(caller, date);
    switch (dailyTotals.get(key)) {
      case (null) { null };
      case (?dailyTotal) { ?toImmutable(dailyTotal) };
    };
  };

  public query ({ caller }) func getBalanceSheet() : async [(Text, DailyTotalView)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can fetch daily totals");
    };

    // Filter to return only the caller's own daily totals
    let callerPrefix = caller.toText() # ":";
    let allEntries = dailyTotals.toArray();

    // Filter entries that belong to the caller and strip the principal prefix
    var callerEntries = Array.empty<(Text, DailyTotalView)>();

    for ((key, total) in allEntries.values()) {
      if (key.startsWith(#text callerPrefix)) {
        // Strip the "principal:" prefix to return just the date
        if (key.size() > callerPrefix.size()) {
          let dateOnly = key.trimStart(#text callerPrefix);
          let immutableEntry : (Text, DailyTotalView) = (dateOnly, toImmutable(total));
          callerEntries := callerEntries.concat([(immutableEntry)]);
        };
      };
    };

    callerEntries;
  };
};
