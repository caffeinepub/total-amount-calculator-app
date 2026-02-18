import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Char "mo:core/Char";
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

  // Key format: "branch:principal:date" to ensure per-user and per-branch isolation
  let dailyTotals = Map.empty<Text, DailyTotal>();

  private func makeKey(branch : Text, user : Principal, date : Text) : Text {
    branch # ":" # user.toText() # ":" # date;
  };

  func isEmptyOrWhitespace(str : Text) : Bool {
    let cleaned = str.toArray().filter(
      func(c) { c != ' ' and c != '\t' and c != '\n' }
    ).toText();
    cleaned == "";
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

  public shared ({ caller }) func saveDailyTotal(branch : Text, date : Text, totalRevenue : Nat64, productQuantities : [(Text, Nat)]) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save daily totals");
    };

    if (isEmptyOrWhitespace(branch)) {
      Runtime.trap("Missing branch identifier. Specify a valid branch");
    };

    let productQuantitiesMap = Map.fromIter<Text, Nat>(productQuantities.values());
    let dailyTotal : DailyTotal = {
      date;
      totalRevenue;
      productQuantities = productQuantitiesMap;
    };

    // Store with branch and user-specific key to ensure strict isolation
    let key = makeKey(branch, caller, date);
    dailyTotals.add(key, dailyTotal);
  };

  func toImmutable(dailyTotal : DailyTotal) : DailyTotalView {
    {
      date = dailyTotal.date;
      totalRevenue = dailyTotal.totalRevenue;
      productQuantities = dailyTotal.productQuantities.toArray();
    };
  };

  public query ({ caller }) func getDailyTotal(branch : Text, date : Text) : async ?DailyTotalView {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can fetch daily totals");
    };

    if (isEmptyOrWhitespace(branch)) {
      Runtime.trap("Missing branch identifier. Specify a valid branch");
    };

    // Only return the caller's own daily total for the given branch and date
    let key = makeKey(branch, caller, date);
    switch (dailyTotals.get(key)) {
      case (null) { null };
      case (?dailyTotal) { ?toImmutable(dailyTotal) };
    };
  };

  public query ({ caller }) func getBalanceSheet(branch : Text) : async [(Text, DailyTotalView)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can fetch daily totals");
    };

    if (isEmptyOrWhitespace(branch)) {
      Runtime.trap("Missing branch identifier. Specify a valid branch");
    };

    // Filter to return only the caller's own daily totals for the specified branch
    let branchUserPrefix = branch # ":" # caller.toText() # ":";
    let allEntries = dailyTotals.toArray();

    var branchEntries = Array.empty<(Text, DailyTotalView)>();

    for ((key, total) in allEntries.values()) {
      if (key.startsWith(#text branchUserPrefix)) {
        // Strip the "branch:principal:" prefix to return just the date
        if (key.size() > branchUserPrefix.size()) {
          let dateOnly = key.trimStart(#text branchUserPrefix);
          let immutableEntry : (Text, DailyTotalView) = (dateOnly, toImmutable(total));
          branchEntries := branchEntries.concat([(immutableEntry)]);
        };
      };
    };

    branchEntries;
  };

  public shared ({ caller }) func clearAllDailyTotals() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can clear all daily totals");
    };
    dailyTotals.clear();
  };
};
