-- Create sequence for invoice numbers
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- Add invoice_number column to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(255) UNIQUE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

-- Update existing invoices with invoice numbers (if any exist)
DO $$
DECLARE
    invoice_record RECORD;
    seq_num INTEGER;
    prefix VARCHAR(2);
    invoice_num VARCHAR(255);
BEGIN
    FOR invoice_record IN 
        SELECT id, type, created_at 
        FROM invoices 
        WHERE invoice_number IS NULL 
        ORDER BY created_at ASC
    LOOP
        -- Get next sequence value
        SELECT nextval('invoice_number_seq') INTO seq_num;
        
        -- Set prefix based on type
        IF invoice_record.type = 'ZONE' THEN
            prefix := 'ZN';
        ELSIF invoice_record.type = 'COMPANY' THEN
            prefix := 'CO';
        ELSE
            prefix := 'PV';
        END IF;
        
        -- Generate invoice number
        invoice_num := prefix || '-' || EXTRACT(YEAR FROM invoice_record.created_at) || '-' || LPAD(seq_num::TEXT, 6, '0');
        
        -- Update the invoice
        UPDATE invoices 
        SET invoice_number = invoice_num 
        WHERE id = invoice_record.id;
    END LOOP;
END $$;
