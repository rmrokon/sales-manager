import request from 'supertest';
import express from 'express';
import cors from 'cors';
import Routes from '../api';
import { sequelize } from '../configs';
import { GlobalReqStore } from '../api/middlewares/golbalReqStore';

// Create test app
const app = express();
app.use(GlobalReqStore);
app.use(cors());
app.use(express.json());
app.use('/v1', Routes());

describe('Inventory-Sales Integration Tests', () => {
  let authToken: string;
  let companyId: string;
  let userId: string;
  let providerId: string;
  let zoneId: string;
  let productId: string;

  beforeAll(async () => {
    // Create test user and company
    const signupResponse = await request(app)
      .post('/v1/credentials/signup')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        name: 'Test Company',
      });

    expect(signupResponse.status).toBe(201);
    
    // Login to get auth token
    const loginResponse = await request(app)
      .post('/v1/credentials/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(loginResponse.status).toBe(200);
    authToken = loginResponse.body.result.accessToken;
    companyId = loginResponse.body.result.user.companyId;
    userId = loginResponse.body.result.user.id;

    // Create test provider
    const providerResponse = await request(app)
      .post('/v1/providers')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Provider',
        email: 'provider@example.com',
        phone: '1234567890',
        address: 'Test Address',
      });

    expect(providerResponse.status).toBe(201);
    providerId = providerResponse.body.result.id;

    // Create test zone
    const zoneResponse = await request(app)
      .post('/v1/zones')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Zone',
        description: 'Test Zone Description',
      });

    expect(zoneResponse.status).toBe(201);
    zoneId = zoneResponse.body.result.id;

    // Create test product
    const productResponse = await request(app)
      .post('/v1/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Product',
        description: 'Test Product Description',
        price: 100,
        sku: 'TEST-001',
      });

    expect(productResponse.status).toBe(201);
    productId = productResponse.body.result.id;
  });

  describe('Provider Invoice -> Inventory Addition', () => {
    it('should add products to inventory when creating provider invoice', async () => {
      // Create provider invoice
      const invoiceResponse = await request(app)
        .post('/v1/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'PROVIDER',
          providerId: providerId,
          items: [
            {
              productId: productId,
              quantity: 50,
              unitPrice: 80,
            },
          ],
        });

      expect(invoiceResponse.status).toBe(201);
      const invoiceId = invoiceResponse.body.result.id;

      // Check inventory was created/updated
      const inventoryResponse = await request(app)
        .get('/v1/inventory')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ productId: productId });

      expect(inventoryResponse.status).toBe(200);
      expect(inventoryResponse.body.result.length).toBe(1);
      expect(inventoryResponse.body.result[0].quantity).toBe(50);
      expect(inventoryResponse.body.result[0].productId).toBe(productId);

      // Check inventory transaction was created
      const transactionResponse = await request(app)
        .get('/v1/inventory-transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ productId: productId });

      expect(transactionResponse.status).toBe(200);
      expect(transactionResponse.body.result.length).toBe(1);
      expect(transactionResponse.body.result[0].type).toBe('PURCHASE');
      expect(transactionResponse.body.result[0].quantity).toBe(50);
      expect(transactionResponse.body.result[0].referenceId).toBe(invoiceId);
    });

    it('should accumulate inventory when creating multiple provider invoices', async () => {
      // Create first provider invoice
      await request(app)
        .post('/v1/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'PROVIDER',
          providerId: providerId,
          items: [
            {
              productId: productId,
              quantity: 30,
              unitPrice: 80,
            },
          ],
        });

      // Create second provider invoice
      await request(app)
        .post('/v1/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'PROVIDER',
          providerId: providerId,
          items: [
            {
              productId: productId,
              quantity: 20,
              unitPrice: 85,
            },
          ],
        });

      // Check inventory accumulated
      const inventoryResponse = await request(app)
        .get('/v1/inventory')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ productId: productId });

      expect(inventoryResponse.status).toBe(200);
      expect(inventoryResponse.body.result[0].quantity).toBe(50); // 30 + 20
    });
  });

  describe('Zone Invoice -> Inventory Deduction', () => {
    beforeEach(async () => {
      // Add initial inventory
      await request(app)
        .post('/v1/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'PROVIDER',
          providerId: providerId,
          items: [
            {
              productId: productId,
              quantity: 100,
              unitPrice: 80,
            },
          ],
        });
    });

    it('should deduct products from inventory when creating zone invoice', async () => {
      // Create zone invoice
      const invoiceResponse = await request(app)
        .post('/v1/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'ZONE',
          zoneId: zoneId,
          items: [
            {
              productId: productId,
              quantity: 30,
              unitPrice: 100,
            },
          ],
        });

      expect(invoiceResponse.status).toBe(201);
      const invoiceId = invoiceResponse.body.result.id;

      // Check inventory was deducted
      const inventoryResponse = await request(app)
        .get('/v1/inventory')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ productId: productId });

      expect(inventoryResponse.status).toBe(200);
      expect(inventoryResponse.body.result[0].quantity).toBe(70); // 100 - 30

      // Check inventory transaction was created
      const transactionResponse = await request(app)
        .get('/v1/inventory-transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ productId: productId, type: 'DISTRIBUTION' });

      expect(transactionResponse.status).toBe(200);
      const distributionTransactions = transactionResponse.body.result.filter(
        (t: any) => t.type === 'DISTRIBUTION'
      );
      expect(distributionTransactions.length).toBe(1);
      expect(distributionTransactions[0].quantity).toBe(-30);
      expect(distributionTransactions[0].referenceId).toBe(invoiceId);
    });

    it('should prevent zone invoice creation when insufficient inventory', async () => {
      // Try to create zone invoice with more quantity than available
      const invoiceResponse = await request(app)
        .post('/v1/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'ZONE',
          zoneId: zoneId,
          items: [
            {
              productId: productId,
              quantity: 150, // More than available (100)
              unitPrice: 100,
            },
          ],
        });

      expect(invoiceResponse.status).toBe(400);
      expect(invoiceResponse.body.message).toContain('Insufficient inventory');
    });
  });
});
