import { IProduct } from '@/utils/types/product';
import { storeApiConfig } from '../api-config';
import { IProvider } from '@/utils/types/provider';

export interface InventoryItem {
  id: string;
  productId: string;
  providerId: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  createdAt: string;
  updatedAt: string;
  product?: Partial<IProduct>;
  provider?: Partial<IProvider>;
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
  product?: Partial<IProduct>;
  provider?: Partial<IProvider>;
  zone?: {
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
    getInventory: builder.query<{result: InventoryItem[], pagination?: any}, Record<string, any>>({
      query: (params) => ({
        url: '/inventory',
        method: 'GET',
        params,
      }),
      transformResponse: (response: any) => {
        const transformedData = response.result.map(item => ({
          ...item, 
          totalValue: Number(item.unitPrice) * Number(item.quantity),
          unitPrice: Number(item.unitPrice)
        }));
        // Handle both paginated and non-paginated responses
        if (response.pagination) {
          return {
            result: transformedData,
            pagination: response.pagination
          };
        }
        console.log(response);
        return  {result: transformedData}
      },
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

    getInventoryTransactions: builder.query<{result: InventoryTransaction[], pagination?: any}, Record<string, any>>({
      query: (params) => ({
        url: '/inventory-transactions',
        method: 'GET',
        params,
      }),
      transformResponse: (response: any) => {
        const transformedData = response.result.map(item => ({
          ...item,
          totalAmount: Number(item.unitPrice) * Number(item.quantity),
          type: item.transactionType
        }));
        // Handle both paginated and non-paginated responses
        if (response.pagination) {
          return {
            result: transformedData,
            pagination: response.pagination
          };
        }

        return {result: transformedData}
      },
      providesTags: ['InventoryTransactions'],
    }),

    getInventoryStats: builder.query<{result: InventoryStats}, void>({
      query: () => ({
        url: '/inventory/stats',
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        const transformedData = {
          ...response.result,
          totalValue: Number(response.result.totalValue),
          lowStockItems: Number(response.result.lowStockItems),
          recentTransactions: Number(response.result.recentTransactions)
        };
        return {result: transformedData}
      },
      providesTags: ['Inventory'],
    }),

    getLowStockItems: builder.query<{result: LowStockItem[], pagination?: any}, { threshold?: number }>({
      query: (params) => ({
        url: '/inventory/low-stock',
        method: 'GET',
        params,
      }),
      transformResponse: (response: any) => {
        const transformedData = response.result.map(item => ({
          ...item,
          currentStock: Number(item.currentStock),
          minimumStock: Number(item.minimumStock),
          providers: item.providers.map(provider => ({
            ...provider,
            quantity: Number(provider.quantity),
            unitPrice: Number(provider.unitPrice)
          }))
        }));
        if(response.pagination){
          return {
            result: transformedData,
            pagination: response.pagination
          }
        }
        return {result: transformedData};
      },
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
