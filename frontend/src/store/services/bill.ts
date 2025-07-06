import { storeApiConfig } from "../api-config";
import { IBill } from "@/utils/types/bill";

export interface BillCreateParams {
  title: string;
  description?: string;
  amount: number;
  invoiceId: string;
}

export interface BillUpdateParams extends Partial<BillCreateParams> {
  id: string;
}

export const billApi = storeApiConfig.injectEndpoints({
  endpoints: (builder) => ({
    getBills: builder.query<IBill[], void>({
      query: () => "/bills",
      providesTags: ["invoice"],
      transformResponse: (response: { result: IBill[] }) => response.result,
    }),
    getBillById: builder.query<IBill, string>({
      query: (id) => `/bills/${id}`,
      providesTags: (result, error, id) => [{ type: "invoice", id }],
      transformResponse: (response: { result: IBill }) => response.result,
    }),
    createBill: builder.mutation<IBill, BillCreateParams>({
      query: (data) => ({
        url: "/bills",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["invoice"],
      transformResponse: (response: { result: IBill }) => response.result,
    }),
    updateBill: builder.mutation<IBill, BillUpdateParams>({
      query: ({ id, ...data }) => ({
        url: `/bills/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ["invoice", { type: "invoice", id }],
      transformResponse: (response: { result: IBill }) => response.result,
    }),
    deleteBill: builder.mutation<void, string>({
      query: (id) => ({
        url: `/bills/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["invoice"],
    }),
  }),
});

export const {
  useGetBillsQuery,
  useGetBillByIdQuery,
  useCreateBillMutation,
  useUpdateBillMutation,
  useDeleteBillMutation,
} = billApi;