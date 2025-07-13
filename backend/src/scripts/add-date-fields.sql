-- Add invoice_date column to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing invoices to have invoice_date same as created_at
UPDATE invoices SET invoice_date = created_at WHERE invoice_date IS NULL;

-- Make invoice_date NOT NULL after setting default values
ALTER TABLE invoices ALTER COLUMN invoice_date SET NOT NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date);

-- Add discount fields to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'amount'));
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_value DECIMAL(10,2) DEFAULT 0;

-- Update invoice type enum to include 'company'
ALTER TYPE invoice_type ADD VALUE IF NOT EXISTS 'company';

-- Note: product_returns table already has return_date column
-- Note: payments table already has payment_date column

-- Verify the changes
SELECT 
    'invoices' as table_name,
    COUNT(*) as total_records,
    COUNT(invoice_date) as records_with_invoice_date
FROM invoices
UNION ALL
SELECT 
    'product_returns' as table_name,
    COUNT(*) as total_records,
    COUNT(return_date) as records_with_return_date
FROM product_returns
UNION ALL
SELECT 
    'payments' as table_name,
    COUNT(*) as total_records,
    COUNT(payment_date) as records_with_payment_date
FROM payments;
