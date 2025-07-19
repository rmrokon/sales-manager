/**
 * Migration script to convert existing products from single price to dual pricing
 * This script should be run after the database schema has been updated
 */

const { sequelize } = require('../configs');
const Product = require('../api/modules/products/model').default;

async function migrateToDualPricing() {
  console.log('Starting migration to dual pricing system...');
  
  try {
    // Start a transaction
    const transaction = await sequelize.transaction();
    
    try {
      // Find all products that have the old price field but missing new price fields
      const productsToMigrate = await Product.findAll({
        where: {
          price: { [sequelize.Sequelize.Op.ne]: null },
          // Only migrate products that don't have the new fields set
          [sequelize.Sequelize.Op.or]: [
            { purchasePrice: null },
            { sellingPrice: null }
          ]
        },
        transaction
      });

      console.log(`Found ${productsToMigrate.length} products to migrate`);

      if (productsToMigrate.length === 0) {
        console.log('No products need migration. All products already have dual pricing.');
        await transaction.rollback();
        return;
      }

      // Migrate each product
      for (const product of productsToMigrate) {
        const currentPrice = product.price;
        
        // Set both purchase and selling price to the current price
        // This maintains backward compatibility
        await product.update({
          purchasePrice: currentPrice,
          sellingPrice: currentPrice
        }, { transaction });

        console.log(`Migrated product "${product.name}" - Price: ${currentPrice} -> Purchase: ${currentPrice}, Selling: ${currentPrice}`);
      }

      // Commit the transaction
      await transaction.commit();
      console.log(`Successfully migrated ${productsToMigrate.length} products to dual pricing system`);
      
      // Optional: Remove the old price column after successful migration
      // Uncomment the following lines if you want to remove the old price column
      /*
      console.log('Removing old price column...');
      await sequelize.query('ALTER TABLE products DROP COLUMN IF EXISTS price');
      console.log('Old price column removed successfully');
      */
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  migrateToDualPricing()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateToDualPricing };
