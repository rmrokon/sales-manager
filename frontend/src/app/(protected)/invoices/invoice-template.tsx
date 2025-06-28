import { formatCurrency, formatDate } from "@/lib/utils";
import { IInvoice, InvoiceType } from "@/utils/types/invoice";
import { IInvoiceItem } from "@/utils/types/invoice";

interface InvoiceTemplateProps {
  invoice: IInvoice;
  items: IInvoiceItem[];
}

export default function InvoiceTemplate({ invoice, items }: InvoiceTemplateProps) {
  const recipientName = invoice.type === InvoiceType.PROVIDER 
    ? invoice.ReceiverProvider?.name 
    : invoice.ReceiverZone?.name;

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);
  };

  const calculateDiscount = () => {
    return items.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice * (item.discountPercent / 100));
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">INVOICE</h1>
          <p className="text-gray-500">#{invoice.id.substring(0, 8)}</p>
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
              <span>{formatDate(invoice.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Invoice ID:</span>
              <span>{invoice.id}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
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

      <div className="mt-8 flex justify-end">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span className="font-medium">Subtotal:</span>
            <span>{formatCurrency(calculateSubtotal())}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-medium">Discount:</span>
            <span>{formatCurrency(calculateDiscount())}</span>
          </div>
          <div className="flex justify-between py-2 border-t border-gray-300">
            <span className="font-medium">Total:</span>
            <span className="font-bold">{formatCurrency(calculateTotal())}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-medium">Paid Amount:</span>
            <span>{formatCurrency(invoice.paidAmount)}</span>
          </div>
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