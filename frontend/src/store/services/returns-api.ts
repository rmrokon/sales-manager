import { storeApiConfig } from "../api-config";

export interface ReturnItem {
  productId: string;
  returnedQuantity: number;
  unitPrice: number;
  returnAmount: number;
}

export interface CreateReturnParams {
  originalInvoiceId: string;
  zoneId: string;
  totalReturnAmount: number;
  remarks?: string;
  returnItems: ReturnItem[];
  paymentAmount?: number;
}

export interface UpdateReturnParams {
  status?: 'pending' | 'approved' | 'rejected';
  remarks?: string;
}

export interface ProductReturn {
  id: string;
  originalInvoiceId: string;
  zoneId: string;
  totalReturnAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  Zone?: {
    id: string;
    name: string;
  };
  OriginalInvoice?: {
    id: string;
    invoiceNumber: string;
  };
  ReturnItems?: Array<{
    id: string;
    productId: string;
    returnedQuantity: number;
    unitPrice: number;
    returnAmount: number;
    Product?: {
      id: string;
      name: string;
    };
  }>;
}

export const returnsApi = storeApiConfig.injectEndpoints({
  endpoints: (builder) => ({
    getReturns: builder.query<ProductReturn[], Record<string, any>>({
      query: (params) => ({
        url: '/returns',
        method: 'GET',
        params,
      }),
      providesTags: ['Returns'],
    }),

    getReturnById: builder.query<ProductReturn, string>({
      query: (id) => ({
        url: `/returns/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Returns', id }],
    }),

    getReturnsByInvoice: builder.query<ProductReturn[], string>({
      query: (invoiceId) => ({
        url: '/returns',
        method: 'GET',
        params: { invoiceId },
      }),
      providesTags: ['Returns'],
    }),

    getReturnsByZone: builder.query<ProductReturn[], string>({
      query: (zoneId) => ({
        url: '/returns',
        method: 'GET',
        params: { zoneId },
      }),
      providesTags: ['Returns'],
    }),

    createReturn: builder.mutation<ProductReturn, CreateReturnParams>({
      query: (body) => ({
        url: '/returns',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Returns', 'Invoices', 'Inventory'],
    }),

    updateReturn: builder.mutation<ProductReturn, { id: string; data: UpdateReturnParams }>({
      query: ({ id, data }) => ({
        url: `/returns/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Returns', id },
        'Returns',
        'Inventory',
      ],
    }),

    approveReturn: builder.mutation<ProductReturn, string>({
      query: (id) => ({
        url: `/returns/${id}/approve`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Returns', id },
        'Returns',
        'Inventory',
        'InventoryTransactions',
      ],
    }),

    rejectReturn: builder.mutation<ProductReturn, string>({
      query: (id) => ({
        url: `/returns/${id}/reject`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Returns', id },
        'Returns',
      ],
    }),
  }),
});

export const {
  useGetReturnsQuery,
  useGetReturnByIdQuery,
  useGetReturnsByInvoiceQuery,
  useGetReturnsByZoneQuery,
  useCreateReturnMutation,
  useUpdateReturnMutation,
  useApproveReturnMutation,
  useRejectReturnMutation,
} = returnsApi;
