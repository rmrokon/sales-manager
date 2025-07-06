import { storeApiConfig } from '../api-config';

export interface InventoryItem {
  id: string;
  productId: string;
  providerId: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  createdAt: string;
  updatedAt: string;
  Product?: {
    id: string;
    name: string;
    price: number;
    description?: string;
  };
  Provider?: {
    id: string;
    name: string;
  };
}

export interface InventoryTransaction {
  id: string;
  productId: string;
  providerId?: string;
  zoneId?: string;
  type: 'PURCHASE' | 'DISTRIBUTION' | 'RETURN';
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  referenceId?: string;
  referenceType?: 'INVOICE' | 'RETURN';
  createdAt: string;
  updatedAt: string;
  Product?: {
    id: string;
    name: string;
    price: number;
    description?: string;
  };
  Provider?: {
    id: string;
    name: string;
  };
  Zone?: {
    id: string;
    name: string;
  };
}

export interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  recentTransactions: number;
}

export interface LowStockItem {
  productId: string;
  productName: string;
  currentStock: number;
  minimumStock: number;
  providers: Array<{
    providerId: string;
    providerName: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export const inventoryApi = storeApiConfig.injectEndpoints({
  endpoints: (builder) => ({
    getInventory: builder.query<InventoryItem[], Record<string, any>>({
      query: (params) => ({
        url: '/inventory',
        method: 'GET',
        params,
      }),
      providesTags: ['Inventory'],
    }),

    getInventoryById: builder.query<InventoryItem, string>({
      query: (id) => ({
        url: `/inventory/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Inventory', id }],
    }),

    getInventoryByProduct: builder.query<InventoryItem[], string>({
      query: (productId) => ({
        url: '/inventory',
        method: 'GET',
        params: { productId },
      }),
      providesTags: ['Inventory'],
    }),

    getInventoryTransactions: builder.query<InventoryTransaction[], Record<string, any>>({
      query: (params) => ({
        url: '/inventory-transactions',
        method: 'GET',
        params,
      }),
      providesTags: ['InventoryTransactions'],
    }),

    getInventoryStats: builder.query<InventoryStats, void>({
      query: () => ({
        url: '/inventory/stats',
        method: 'GET',
      }),
      providesTags: ['Inventory'],
    }),

    getLowStockItems: builder.query<LowStockItem[], { threshold?: number }>({
      query: (params) => ({
        url: '/inventory/low-stock',
        method: 'GET',
        params,
      }),
      providesTags: ['Inventory'],
    }),

    updateInventory: builder.mutation<InventoryItem, { id: string; data: Partial<InventoryItem> }>({
      query: ({ id, data }) => ({
        url: `/inventory/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Inventory', id },
        'Inventory',
        'InventoryTransactions',
      ],
    }),
  }),
});

export const {
  useGetInventoryQuery,
  useGetInventoryByIdQuery,
  useGetInventoryByProductQuery,
  useGetInventoryTransactionsQuery,
  useGetInventoryStatsQuery,
  useGetLowStockItemsQuery,
  useUpdateInventoryMutation,
} = inventoryApi;
