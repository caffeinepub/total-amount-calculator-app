import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBranchAuth } from "@/hooks/useBranchAuth";
import { CheckCircle2, Lock, Save, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { readImageFileAsDataUrl } from "../calculator/utils/readImageFileAsDataUrl";
import {
  getFixedPrintLocationForBranchUser,
  isFixedBranchUser,
} from "./branchFixedPrintLocation";
import { RECEIPT_STYLES, type ReceiptStyleId } from "./receiptStyles";
import { useOptimizeBillDefaults } from "./useOptimizeBillDefaults";

export function OptimizeBillPage() {
  const { branchUser } = useBranchAuth();
  const { defaults, saveDefaults } = useOptimizeBillDefaults();

  const [receiptStyle, setReceiptStyle] = useState<ReceiptStyleId>(
    defaults.receiptStyle,
  );
  const [paymentScanDataUrl, setPaymentScanDataUrl] = useState<
    string | undefined
  >(defaults.paymentScanDataUrl);
  const [printLocationAddress, setPrintLocationAddress] = useState<string>(
    defaults.printLocationAddress || "",
  );
  const [tableNumber, setTableNumber] = useState<string>(
    defaults.tableNumber || "",
  );
  const [serverName, setServerName] = useState<string>(
    defaults.serverName || "",
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check if current branch has a fixed address
  const isFixedBranch = isFixedBranchUser(branchUser);
  const fixedAddress = getFixedPrintLocationForBranchUser(branchUser);

  // Re-initialize state when branch changes or defaults change
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally exclude setters
  useEffect(() => {
    setReceiptStyle(defaults.receiptStyle);
    setPaymentScanDataUrl(defaults.paymentScanDataUrl);
    setTableNumber(defaults.tableNumber || "");
    setServerName(defaults.serverName || "");

    // For fixed branches, always use the fixed address
    if (fixedAddress) {
      setPrintLocationAddress(fixedAddress);
    } else {
      setPrintLocationAddress(defaults.printLocationAddress || "");
    }
  }, [defaults, branchUser, fixedAddress]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      setPaymentScanDataUrl(dataUrl);
    } catch (error) {
      if (error instanceof Error) {
        setUploadError(
          error.message === "File must be an image"
            ? "Please upload a valid image file (JPG, PNG, etc.)"
            : "Failed to read the image file. Please try again.",
        );
      } else {
        setUploadError("An unexpected error occurred. Please try again.");
      }
    }

    // Reset input
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    setPaymentScanDataUrl(undefined);
    setUploadError(null);
  };

  const handleSaveDefaults = async () => {
    setIsSaving(true);
    try {
      await saveDefaults({
        receiptStyle,
        paymentScanDataUrl,
        printLocationAddress: printLocationAddress.trim() || undefined,
        tableNumber: tableNumber.trim() || undefined,
        serverName: serverName.trim() || undefined,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving defaults:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Optimize Bill</h2>
        <p className="text-muted-foreground mt-2">
          Configure default bill format settings that will be applied to all
          future bills
        </p>
      </div>

      <div className="grid gap-6">
        {/* Receipt Style Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Receipt Style</CardTitle>
            <CardDescription>
              Choose the layout style for printed receipts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={receiptStyle}
              onValueChange={(value) =>
                setReceiptStyle(value as ReceiptStyleId)
              }
            >
              <TabsList className="grid w-full grid-cols-4">
                {RECEIPT_STYLES.map((style) => (
                  <TabsTrigger key={style.id} value={style.id}>
                    {style.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                {RECEIPT_STYLES.find((s) => s.id === receiptStyle)?.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Scan Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Scan</CardTitle>
            <CardDescription>
              Upload a scan or image of your payment information (optional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentScanDataUrl ? (
              <div className="space-y-4">
                <div className="relative border rounded-lg overflow-hidden bg-muted">
                  <img
                    src={paymentScanDataUrl}
                    alt="Payment scan"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    document.getElementById("payment-scan-input")?.click()
                  }
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Change Image
                </Button>
              </div>
            ) : (
              <div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    document.getElementById("payment-scan-input")?.click()
                  }
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Payment Scan
                </Button>
                {uploadError && (
                  <p className="text-sm text-destructive mt-2">{uploadError}</p>
                )}
              </div>
            )}
            <input
              id="payment-scan-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </CardContent>
        </Card>

        {/* Print Location Address */}
        <Card>
          <CardHeader>
            <CardTitle>Print Location Address</CardTitle>
            <CardDescription>
              {isFixedBranch
                ? "The address is fixed for your branch and cannot be changed"
                : "Enter the address where bills are printed (optional)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label
                htmlFor="print-location"
                className="flex items-center gap-2"
              >
                Address
                {isFixedBranch && (
                  <Lock className="h-3 w-3 text-muted-foreground" />
                )}
              </Label>
              <Input
                id="print-location"
                type="text"
                placeholder="Enter print location address"
                value={printLocationAddress}
                onChange={(e) => setPrintLocationAddress(e.target.value)}
                disabled={isFixedBranch}
                className={isFixedBranch ? "bg-muted cursor-not-allowed" : ""}
              />
              {isFixedBranch && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  This address is automatically set for the {branchUser} branch
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table & Server Info (for Vintage style) */}
        <Card>
          <CardHeader>
            <CardTitle>Table &amp; Server Info</CardTitle>
            <CardDescription>
              Used in the Vintage receipt style to show table number and server
              name on the bill
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="table-number">Table Number</Label>
                <Input
                  id="table-number"
                  type="text"
                  placeholder="e.g. 5"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  data-ocid="optimize_bill.table_number.input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="server-name">Server Name</Label>
                <Input
                  id="server-name"
                  type="text"
                  placeholder="e.g. Priya"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  data-ocid="optimize_bill.server_name.input"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          {saveSuccess && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Defaults saved successfully!</span>
            </div>
          )}
          <Button
            onClick={handleSaveDefaults}
            className="gap-2"
            disabled={isSaving}
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Defaults"}
          </Button>
        </div>
      </div>
    </div>
  );
}
