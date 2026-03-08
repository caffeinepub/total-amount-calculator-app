import { Button } from "@/components/ui/button";
import { getActiveBranch } from "@/utils/branchScopedStorage";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Printer } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatCurrency } from "../calculator/format";
import { type SavedBillRecord, getBillById } from "../calculator/savedBills";
import { RECEIPT_STYLES } from "../optimizeBill/receiptStyles";

export function PrintViewPage() {
  const navigate = useNavigate();
  const [bill, setBill] = useState<SavedBillRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [printAttempted, setPrintAttempted] = useState(false);
  const printTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const billId = params.get("id");
    const shouldPrint = params.get("print") === "true";
    const branchParam = params.get("branch");

    if (!billId) {
      setError("No bill ID provided");
      return;
    }

    const targetBranch = branchParam || getActiveBranch();

    if (!targetBranch) {
      setError("No branch context available");
      return;
    }

    const loadedBill = getBillById(billId, targetBranch);

    if (!loadedBill) {
      setError("Bill not found");
      return;
    }

    setBill(loadedBill);

    if (shouldPrint && !printAttempted) {
      setPrintAttempted(true);
      printTimeoutRef.current = window.setTimeout(() => {
        window.print();
      }, 600);
    }

    return () => {
      if (printTimeoutRef.current !== null) {
        window.clearTimeout(printTimeoutRef.current);
      }
    };
  }, [printAttempted]);

  const handleManualPrint = () => {
    window.print();
  };

  const handleBackToCalculator = () => {
    navigate({ to: "/" });
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={handleBackToCalculator} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Calculator
          </Button>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading bill...</p>
      </div>
    );
  }

  const receiptStyle =
    RECEIPT_STYLES.find(
      (style) => style.id === bill.billFormatSnapshot.receiptStyle,
    ) || RECEIPT_STYLES[0];

  const styleClass = receiptStyle.id;

  // ── Thermal style ────────────────────────────────────────────────────────
  if (styleClass === "thermal") {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="no-print sticky top-0 z-10 bg-white border-b shadow-sm p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <Button
              onClick={handleBackToCalculator}
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Calculator
            </Button>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                If the print dialog didn't appear, click the button →
              </p>
              <Button onClick={handleManualPrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Print Bill
              </Button>
            </div>
          </div>
        </div>

        <div className="thermal-bill-wrapper">
          <div className="thermal-bill">
            <div className="thermal-header">
              <p className="thermal-restaurant-name">
                Varshini Classic Cuisine
              </p>
              {bill.billFormatSnapshot.printLocationAddress && (
                <p className="thermal-address">
                  {bill.billFormatSnapshot.printLocationAddress}
                </p>
              )}
              <p className="thermal-separator">
                --------------------------------
              </p>
              <div className="thermal-meta">
                <span>Bill#: {bill.billCode}</span>
                <span>{new Date(bill.timestamp).toLocaleString("en-IN")}</span>
              </div>
              <p className="thermal-separator">
                --------------------------------
              </p>
            </div>

            <div className="thermal-items">
              <div className="thermal-item-header">
                <span className="thermal-col-item">Item</span>
                <span className="thermal-col-qty">Qty</span>
                <span className="thermal-col-price">Amt</span>
              </div>
              <p className="thermal-separator">
                --------------------------------
              </p>
              {bill.lineItems.map((item) => (
                <div
                  key={`${item.label}-${item.unitPrice}`}
                  className="thermal-item-row"
                >
                  <span className="thermal-col-item">{item.label}</span>
                  <span className="thermal-col-qty">{item.quantity}</span>
                  <span className="thermal-col-price">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </span>
                </div>
              ))}
            </div>

            <p className="thermal-separator">
              --------------------------------
            </p>

            <div className="thermal-totals">
              <div className="thermal-totals-row">
                <span>Subtotal</span>
                <span>{formatCurrency(bill.breakdown.subtotal)}</span>
              </div>
              {bill.breakdown.taxAmount > 0 && (
                <div className="thermal-totals-row">
                  <span>Tax ({bill.taxRate}%)</span>
                  <span>+{formatCurrency(bill.breakdown.taxAmount)}</span>
                </div>
              )}
              {bill.breakdown.discountAmount > 0 && (
                <div className="thermal-totals-row">
                  <span>
                    Discount (
                    {bill.discountType === "percentage"
                      ? `${bill.discountValue}%`
                      : formatCurrency(bill.discountValue)}
                    )
                  </span>
                  <span>-{formatCurrency(bill.breakdown.discountAmount)}</span>
                </div>
              )}
            </div>

            <p className="thermal-separator">
              ================================
            </p>
            <div className="thermal-grand-total">
              <span>TOTAL</span>
              <span>{formatCurrency(bill.breakdown.finalTotal)}</span>
            </div>
            <p className="thermal-separator">
              ================================
            </p>

            {bill.billFormatSnapshot.paymentScanDataUrl && (
              <div className="thermal-payment-scan">
                <img
                  src={bill.billFormatSnapshot.paymentScanDataUrl}
                  alt="Payment"
                  className="thermal-payment-image"
                />
              </div>
            )}

            <div className="thermal-footer">
              <p>** Thank You! Visit Again **</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Vintage style ────────────────────────────────────────────────────────
  if (styleClass === "vintage") {
    const subtotal = bill.breakdown.subtotal;
    const gst = subtotal * 0.05;
    const serviceCharge = subtotal * 0.1;
    const total =
      subtotal + gst + serviceCharge - bill.breakdown.discountAmount;

    // Monospaced helper: pad a label and value to fill W chars
    const W = 32;
    const row = (label: string, value: string) => {
      const gap = W - label.length - value.length;
      return label + (gap > 0 ? " ".repeat(gap) : " ") + value;
    };
    const sep = "-".repeat(W);
    const dbl = "=".repeat(W);

    const dt = new Date(bill.timestamp);
    const dateStr = dt.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timeStr = dt.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div className="min-h-screen bg-gray-200">
        <div className="no-print sticky top-0 z-10 bg-white border-b shadow-sm p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <Button
              onClick={handleBackToCalculator}
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Calculator
            </Button>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                If the print dialog didn't appear, click the button →
              </p>
              <Button onClick={handleManualPrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Print Bill
              </Button>
            </div>
          </div>
        </div>

        <div className="vintage-bill-wrapper">
          <div className="vintage-bill">
            {/* Header */}
            <div className="vintage-center">{dbl}</div>
            <div className="vintage-center vintage-title">
              THE GOLDEN GRILLE
            </div>
            {bill.billFormatSnapshot.printLocationAddress && (
              <div className="vintage-center vintage-subtitle">
                {bill.billFormatSnapshot.printLocationAddress}
              </div>
            )}
            <div className="vintage-center">{dbl}</div>
            <div className="vintage-line">{`Date : ${dateStr}`}</div>
            <div className="vintage-line">{`Time : ${timeStr}`}</div>
            <div className="vintage-line">{`Bill#: ${bill.billCode}`}</div>
            {bill.billFormatSnapshot.tableNumber && (
              <div className="vintage-line">{`Table: ${bill.billFormatSnapshot.tableNumber}`}</div>
            )}
            {bill.billFormatSnapshot.serverName && (
              <div className="vintage-line">{`Serv : ${bill.billFormatSnapshot.serverName}`}</div>
            )}
            <div className="vintage-line">{sep}</div>

            {/* Column header */}
            <div className="vintage-line vintage-bold">
              {row("ITEM x QTY", "AMOUNT")}
            </div>
            <div className="vintage-line">{sep}</div>

            {/* Line items */}
            {bill.lineItems.map((item) => {
              const amt = `Rs.${(item.quantity * item.unitPrice).toFixed(2)}`;
              const label = `${item.label} x${item.quantity}`;
              return (
                <div
                  key={`${item.label}-${item.unitPrice}`}
                  className="vintage-line"
                >
                  {row(label, amt)}
                </div>
              );
            })}

            <div className="vintage-line">{sep}</div>

            {/* Subtotal, GST, Service, Discount, Total */}
            <div className="vintage-line">
              {row("Subtotal", `Rs.${subtotal.toFixed(2)}`)}
            </div>
            <div className="vintage-line">
              {row("GST (5%)", `Rs.${gst.toFixed(2)}`)}
            </div>
            <div className="vintage-line">
              {row("Service Charge (10%)", `Rs.${serviceCharge.toFixed(2)}`)}
            </div>
            {bill.breakdown.discountAmount > 0 && (
              <div className="vintage-line">
                {row(
                  bill.discountType === "percentage"
                    ? `Discount (${bill.discountValue}%)`
                    : "Discount",
                  `-Rs.${bill.breakdown.discountAmount.toFixed(2)}`,
                )}
              </div>
            )}
            <div className="vintage-line">{dbl}</div>
            <div className="vintage-line vintage-bold vintage-total">
              {row("TOTAL", `Rs.${total.toFixed(2)}`)}
            </div>
            <div className="vintage-line">{dbl}</div>

            {/* Payment scan */}
            {bill.billFormatSnapshot.paymentScanDataUrl && (
              <div className="vintage-center" style={{ margin: "10px 0" }}>
                <img
                  src={bill.billFormatSnapshot.paymentScanDataUrl}
                  alt="Payment"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </div>
            )}

            {/* Footer */}
            <div className="vintage-center vintage-thanks">
              ** THANK YOU! **
            </div>
            <div className="vintage-center vintage-subtitle">
              We hope to see you again!
            </div>
            <div className="vintage-line">{sep}</div>
            <div className="vintage-line">Tip: ___________________________</div>
            <div className="vintage-line">
              Signature: ______________________
            </div>
            <div className="vintage-line">{sep}</div>
          </div>
        </div>
      </div>
    );
  }

  // ── Classic / Compact styles ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Screen controls — hidden during print */}
      <div className="no-print sticky top-0 z-10 bg-white border-b shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Button
            onClick={handleBackToCalculator}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Calculator
          </Button>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              If the print dialog didn't appear, click the button →
            </p>
            <Button onClick={handleManualPrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Print Bill
            </Button>
          </div>
        </div>
      </div>

      {/* Classic Bill */}
      <div className="classic-bill-wrapper">
        <div className={`classic-bill ${styleClass}`}>
          {/* ── Header ── */}
          <div className="classic-bill-header">
            <div className="classic-bill-header-rule-top" />
            <div className="classic-bill-name-frame">
              <h1 className="classic-bill-restaurant">
                Varshini Classic Cuisine
              </h1>
              <p className="classic-bill-tagline-subtitle">
                Est. — Fine Indian Cuisine
              </p>
            </div>
            <div className="classic-bill-header-rule-bottom" />
            {bill.billFormatSnapshot.printLocationAddress && (
              <p className="classic-bill-address">
                {bill.billFormatSnapshot.printLocationAddress}
              </p>
            )}
            <div className="classic-bill-divider-thick" />
            {/* 2-column meta grid with center divider */}
            <div className="classic-bill-meta">
              <div className="classic-bill-meta-col">
                <div className="classic-bill-meta-row">
                  <span className="classic-bill-meta-label">Bill No</span>
                  <span className="classic-bill-meta-value">
                    {bill.billCode}
                  </span>
                </div>
              </div>
              <div className="classic-bill-meta-divider" />
              <div className="classic-bill-meta-col">
                <div className="classic-bill-meta-row">
                  <span className="classic-bill-meta-label">Date</span>
                  <span className="classic-bill-meta-value">
                    {new Date(bill.timestamp).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="classic-bill-meta-row">
                  <span className="classic-bill-meta-label">Time</span>
                  <span className="classic-bill-meta-value">
                    {new Date(bill.timestamp).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
            <div className="classic-bill-divider" />
          </div>

          {/* ── Items Table ── */}
          <table className="classic-bill-table">
            <thead>
              <tr>
                <th className="classic-th classic-th-left">Item</th>
                <th className="classic-th classic-th-center">Qty</th>
                <th className="classic-th classic-th-right">Rate</th>
                <th className="classic-th classic-th-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bill.lineItems.map((item, idx) => (
                <tr
                  key={`${item.label}-${item.unitPrice}`}
                  className={
                    idx % 2 === 0 ? "classic-tr-even" : "classic-tr-odd"
                  }
                >
                  <td className="classic-td classic-td-left">{item.label}</td>
                  <td className="classic-td classic-td-center">
                    {item.quantity}
                  </td>
                  <td className="classic-td classic-td-right">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="classic-td classic-td-right classic-td-amount">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="classic-bill-divider" />

          {/* ── Totals (right-aligned 260px block) ── */}
          <div className="classic-bill-totals">
            <div className="classic-totals-block">
              <div className="classic-totals-row">
                <span>Subtotal</span>
                <span>{formatCurrency(bill.breakdown.subtotal)}</span>
              </div>
              {bill.breakdown.taxAmount > 0 && (
                <div className="classic-totals-row">
                  <span>Tax ({bill.taxRate}%)</span>
                  <span>+ {formatCurrency(bill.breakdown.taxAmount)}</span>
                </div>
              )}
              {bill.breakdown.discountAmount > 0 && (
                <div className="classic-totals-row">
                  <span>
                    Discount (
                    {bill.discountType === "percentage"
                      ? `${bill.discountValue}%`
                      : formatCurrency(bill.discountValue)}
                    )
                  </span>
                  <span>- {formatCurrency(bill.breakdown.discountAmount)}</span>
                </div>
              )}
              <div className="classic-totals-row classic-totals-grand">
                <span>GRAND TOTAL</span>
                <span>{formatCurrency(bill.breakdown.finalTotal)}</span>
              </div>
            </div>
          </div>

          {/* ── Payment Scan ── */}
          {bill.billFormatSnapshot.paymentScanDataUrl && (
            <div className="classic-bill-payment">
              <p className="classic-bill-payment-label">Payment</p>
              <img
                src={bill.billFormatSnapshot.paymentScanDataUrl}
                alt="Payment information"
                className="classic-bill-payment-image"
              />
            </div>
          )}

          {/* ── Footer ── */}
          <div className="classic-bill-divider" />
          <div className="classic-bill-footer">
            <span className="classic-bill-footer-ornament">✦ ✦ ✦</span>
            <p className="classic-bill-thanks">Thank you for your visit!</p>
            <p className="classic-bill-tagline">We hope to see you again.</p>
            <span className="classic-bill-footer-ornament-bottom">✦ ✦ ✦</span>
          </div>
        </div>
      </div>
    </div>
  );
}
