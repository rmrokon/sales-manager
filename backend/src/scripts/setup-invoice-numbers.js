const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'sm_dev',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'password',
});

async function setupInvoiceNumbers() {
  try {
    await client.connect();
    console.log('Connected to database');

    // Create sequence for invoice numbers
    await client.query('CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1');
    console.log('Created invoice_number_seq sequence');

    // Add invoice_number column to invoices table
    await client.query('ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(255) UNIQUE');
    console.log('Added invoice_number column');

    // Create index for better performance
    await client.query('CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number)');
    console.log('Created index on invoice_number');

    // Update existing invoices with invoice numbers
    const existingInvoices = await client.query(`
      SELECT id, type, created_at 
      FROM invoices 
      WHERE invoice_number IS NULL 
      ORDER BY created_at ASC
    `);

    console.log(`Found ${existingInvoices.rows.length} invoices without invoice numbers`);

    for (const invoice of existingInvoices.rows) {
      // Get next sequence value
      const seqResult = await client.query("SELECT nextval('invoice_number_seq') AS seq");
      const seq = String(seqResult.rows[0].seq).padStart(6, '0');
      
      // Set prefix based on type
      let prefix;
      if (invoice.type === 'ZONE') {
        prefix = 'ZN';
      } else if (invoice.type === 'COMPANY') {
        prefix = 'CO';
      } else {
        prefix = 'PV';
      }
      
      // Generate invoice number
      const year = new Date(invoice.created_at).getFullYear();
      const invoiceNumber = `${prefix}-${year}-${seq}`;
      
      // Update the invoice
      await client.query(
        'UPDATE invoices SET invoice_number = $1 WHERE id = $2',
        [invoiceNumber, invoice.id]
      );
      
      console.log(`Updated invoice ${invoice.id} with number ${invoiceNumber}`);
    }

    console.log('Invoice number setup completed successfully!');
  } catch (error) {
    console.error('Error setting up invoice numbers:', error);
  } finally {
    await client.end();
  }
}

setupInvoiceNumbers();
