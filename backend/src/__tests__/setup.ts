import 'dotenv/config';
import { sequelize } from '../configs';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'sm_test';
process.env.DB_USER = 'admin';
process.env.DB_PASSWORD = 'password';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';

beforeAll(async () => {
  // Sync database for tests
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  // Close database connection
  await sequelize.close();
});

beforeEach(async () => {
  // Clean up database before each test
  await sequelize.truncate({ cascade: true, restartIdentity: true });
});
