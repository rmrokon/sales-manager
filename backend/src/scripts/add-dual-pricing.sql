-- Migration script to add dual pricing to products table
-- This script adds purchasePrice and sellingPrice columns and migrates existing data

-- Step 1: Add new columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(10, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS selling_price DECIMAL(10, 2);

-- Step 2: Migrate existing data (copy current price to both new fields)
UPDATE products 
SET 
    purchase_price = price,
    selling_price = price 
WHERE purchase_price IS NULL OR selling_price IS NULL;

-- Step 3: Make new columns NOT NULL after setting default values
ALTER TABLE products ALTER COLUMN purchase_price SET NOT NULL;
ALTER TABLE products ALTER COLUMN selling_price SET NOT NULL;

-- Step 4: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_purchase_price ON products(purchase_price);
CREATE INDEX IF NOT EXISTS idx_products_selling_price ON products(selling_price);

-- Step 5: Add constraints to ensure prices are positive
ALTER TABLE products ADD CONSTRAINT chk_purchase_price_positive CHECK (purchase_price >= 0);
ALTER TABLE products ADD CONSTRAINT chk_selling_price_positive CHECK (selling_price >= 0);

-- Note: The old 'price' column will be removed in a separate step after confirming the migration works
-- For now, we keep it to ensure backward compatibility during the transition
