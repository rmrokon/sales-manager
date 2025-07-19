import { storeApiConfig } from "../api-config";
import { CreateReturnParams, ProductReturn, UpdateReturnParams } from "@/utils/types/returns";



export const returnsApi = storeApiConfig.injectEndpoints({
  endpoints: (builder) => ({
    getReturns: builder.query<{result: ProductReturn[]; pagination?: any}, Record<string, any>>({
      query: (params) => ({
        url: '/returns',
        method: 'GET',
        params,
      }),
      transformResponse: (response: any) => {
        // Handle both paginated and non-paginated responses
        if (response.pagination) {
          return {
            result: response.result,
            pagination: response.pagination
          };
        }
        return { result: response.result };
      },
      providesTags: ['Returns'],
    }),

    getReturnById: builder.query<{result: ProductReturn}, string>({
      query: (id) => ({
        url: `/returns/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        const transformedData = {
          ...response.result,
          totalReturnAmount: Number(response.result.totalReturnAmount),
          zone: response.result.zone,
          returnItems: response.result.ReturnItems.map(item => ({
            ...item,
            returnAmount: Number(item.returnAmount),
            unitPrice: Number(item.unitPrice),
            returnedQuantity: Number(item.returnedQuantity)
          }))
        };
        if(response.pagination){
          return {
            result: transformedData,
            pagination: response.pagination
          }
        }
        return {result: transformedData}
      },
      providesTags: (result, error, id) => [{ type: 'Returns', id }],
    }),

    getReturnsByInvoice: builder.query<{result: ProductReturn[], pagination?: any}, string>({
      query: (invoiceId) => ({
        url: '/returns',
        method: 'GET',
        params: { invoiceId },
      }),
      transformResponse: (res: any)=>{
        const transformedData = res.result;
        if(res.pagination){
          return {
            result: transformedData,
            pagination: res.pagination
          }
        }
        return {result: res.result}
      },
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
      invalidatesTags: ['Returns', 'invoice', 'Inventory'],
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
