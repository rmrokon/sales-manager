import { formatCurrency, formatDate } from "@/lib/utils";
import { IInvoice, InvoiceType } from "@/utils/types/invoice";
import { IInvoiceItem } from "@/utils/types/invoice";
import { IBill } from "@/utils/types/bill";

interface InvoiceTemplateProps {
  invoice: IInvoice;
  items?: IInvoiceItem[];
  bills?: IBill[];
}

export default function InvoiceTemplate({ invoice, items = [], bills = [] }: InvoiceTemplateProps) {
  const recipientName = invoice.type === InvoiceType.PROVIDER
    ? invoice.ReceiverProvider?.name
    : invoice.type === InvoiceType.ZONE
    ? invoice.ReceiverZone?.name
    : "Company (Internal)";

  const calculateSubtotal = () => {
    const itemsTotal = items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);
    const billsTotal = bills.reduce((sum, bill) => {
      return sum + bill.amount;
    }, 0);
    return itemsTotal + billsTotal;
  };

  const calculateItemDiscount = () => {
    return items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice * (item.discountPercent / 100));
    }, 0);
  };

  const calculateOverallDiscount = () => {
    if (!invoice.discountValue || invoice.discountValue === 0) return 0;

    const subtotalAfterItemDiscounts = calculateSubtotal() - calculateItemDiscount();

    if (invoice.discountType === 'percentage') {
      return (subtotalAfterItemDiscounts * invoice.discountValue) / 100;
    }
    return invoice.discountValue;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateItemDiscount() - calculateOverallDiscount();
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">INVOICE</h1>
          <p className="text-lg font-mono font-semibold text-blue-600">{invoice.invoiceNumber}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold">Your Company Name</h2>
          <p>123 Business Street</p>
          <p>City, State ZIP</p>
          <p>contact@yourcompany.com</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mt-8">
        <div>
          <h3 className="font-semibold text-gray-700">Bill To:</h3>
          <p className="mt-2">{recipientName}</p>
          <p>Type: {invoice.type}</p>
        </div>
        <div className="text-right">
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="font-medium">Invoice Date:</span>
              <span>{formatDate(invoice.invoiceDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Invoice ID:</span>
              <span>{invoice.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Show Items Table if items exist */}
      {items.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold mb-4">Items</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="py-2 text-left">Item</th>
                <th className="py-2 text-right">Quantity</th>
                <th className="py-2 text-right">Unit Price</th>
                <th className="py-2 text-right">Discount</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-3">{item.Product?.name || 'Unknown Product'}</td>
                  <td className="py-3 text-right">{item.quantity}</td>
                  <td className="py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-3 text-right">{item.discountPercent}%</td>
                  <td className="py-3 text-right">
                    {formatCurrency(
                      item.quantity * item.unitPrice * (1 - item.discountPercent / 100)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Show Bills Table if bills exist */}
      {bills.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold mb-4">Bills</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="py-2 text-left">Title</th>
                <th className="py-2 text-left">Description</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr key={bill.id} className="border-b border-gray-200">
                  <td className="py-3">{bill.title}</td>
                  <td className="py-3">{bill.description || '-'}</td>
                  <td className="py-3 text-right">
                    {formatCurrency(bill.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span className="font-medium">Subtotal:</span>
            <span>{formatCurrency(calculateSubtotal())}</span>
          </div>

          {/* Item-level discounts */}
          {calculateItemDiscount() > 0 && (
            <div className="flex justify-between py-2 text-orange-600">
              <span className="font-medium">Item Discounts:</span>
              <span>-{formatCurrency(calculateItemDiscount())}</span>
            </div>
          )}

          {/* Overall discount */}
          {calculateOverallDiscount() > 0 && (
            <div className="flex justify-between py-2 text-red-600">
              <span className="font-medium">
                Overall Discount ({invoice.discountType === 'percentage' ? `${invoice.discountValue}%` : 'Amount'}):
              </span>
              <span>-{formatCurrency(calculateOverallDiscount())}</span>
            </div>
          )}

          <div className="flex justify-between py-2 border-t border-gray-300">
            <span className="font-medium">Total:</span>
            <span className="font-bold">{formatCurrency(invoice.totalAmount)}</span>
          </div>
          {invoice.paidAmount > 0 && (
            <div className="flex justify-between py-2">
              <span className="font-medium">Down Payment:</span>
              <span>-{formatCurrency(invoice.paidAmount)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-t border-gray-300">
            <span className="font-medium">Due Amount:</span>
            <span className="font-bold">{formatCurrency(invoice.dueAmount)}</span>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-gray-300 pt-6">
        <h3 className="font-semibold">Payment Information</h3>
        <p className="mt-2">
          Please make payment to the following bank account:
        </p>
        <div className="mt-2">
          <p>Bank: Your Bank Name</p>
          <p>Account Number: XXXX-XXXX-XXXX-XXXX</p>
          <p>Routing Number: XXXXXXXXX</p>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          Payment is due within 30 days. Thank you for your business.
        </p>
      </div>
    </div>
  );
}