import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X, Save, CheckCircle2 } from 'lucide-react';
import { useOptimizeBillDefaults } from './useOptimizeBillDefaults';
import { RECEIPT_STYLES, ReceiptStyleId } from './receiptStyles';
import { readImageFileAsDataUrl } from '../calculator/utils/readImageFileAsDataUrl';

export function OptimizeBillPage() {
  const { defaults, saveDefaults } = useOptimizeBillDefaults();
  
  const [receiptStyle, setReceiptStyle] = useState<ReceiptStyleId>(defaults.receiptStyle);
  const [paymentScanDataUrl, setPaymentScanDataUrl] = useState<string | undefined>(defaults.paymentScanDataUrl);
  const [printLocationAddress, setPrintLocationAddress] = useState<string>(defaults.printLocationAddress || '');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      setPaymentScanDataUrl(dataUrl);
    } catch (error) {
      if (error instanceof Error) {
        setUploadError(error.message === 'File must be an image' 
          ? 'Please upload a valid image file (JPG, PNG, etc.)'
          : 'Failed to read the image file. Please try again.');
      } else {
        setUploadError('An unexpected error occurred. Please try again.');
      }
    }

    // Reset input
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    setPaymentScanDataUrl(undefined);
    setUploadError(null);
  };

  const handleSaveDefaults = () => {
    saveDefaults({
      receiptStyle,
      paymentScanDataUrl,
      printLocationAddress: printLocationAddress.trim() || undefined,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Optimize Bill</h2>
        <p className="text-muted-foreground mt-2">
          Configure default bill format settings that will be applied to all future bills
        </p>
      </div>

      <div className="grid gap-6">
        {/* Receipt Style Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Receipt Style</CardTitle>
            <CardDescription>Choose the layout style for printed receipts</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={receiptStyle} onValueChange={(value) => setReceiptStyle(value as ReceiptStyleId)}>
              <TabsList className="grid w-full grid-cols-2">
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
            <CardDescription>Upload a scan or image of your payment information (optional)</CardDescription>
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
                <Button variant="outline" className="w-full" onClick={() => document.getElementById('payment-scan-input')?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Change Image
                </Button>
              </div>
            ) : (
              <div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('payment-scan-input')?.click()}
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
            <CardDescription>Enter the address where bills are printed (optional)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="print-location">Address</Label>
              <Input
                id="print-location"
                type="text"
                placeholder="Enter print location address"
                value={printLocationAddress}
                onChange={(e) => setPrintLocationAddress(e.target.value)}
              />
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
          <Button onClick={handleSaveDefaults} className="gap-2">
            <Save className="h-4 w-4" />
            Save Defaults
          </Button>
        </div>
      </div>
    </div>
  );
}
