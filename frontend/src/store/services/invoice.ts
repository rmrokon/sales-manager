import { storeApiConfig } from "../api-config";
import { IInvoice, InvoiceType } from "@/utils/types/invoice";

export interface InvoiceCreateParams {
  type: InvoiceType;
  fromUserId: string;
  toProviderId?: string;
  toZoneId?: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
}

export interface InvoiceUpdateParams extends Partial<InvoiceCreateParams> {
  id: string;
}

export interface RecordPaymentParams {
  invoiceId: string;
  amount: number;
}

export const invoiceApi = storeApiConfig.injectEndpoints({
  endpoints: (builder) => ({
    getInvoices: builder.query({
      query: (params) => ({
        url: "/invoices",
        method: "GET",
        params,
        credentials: "include",
      }),
      providesTags: ["invoice"],
    }),

    getInvoiceById: builder.query({
      query: (id) => ({
        url: `/invoices/${id}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result, error, id) => [{ type: "invoice", id }],
    }),

    getInvoiceWithItems: builder.query({
      query: (id) => ({
        url: `/invoices/${id}/with-items`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result, error, id) => [{ type: "invoice", id }],
    }),

    createInvoice: builder.mutation({
      query: (data: InvoiceCreateParams) => ({
        url: "/invoices",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["invoice"],
    }),

    updateInvoice: builder.mutation({
      query: ({ id, ...data }: InvoiceUpdateParams) => ({
        url: `/invoices/${id}`,
        method: "PATCH",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: (result, error, { id }) => [
        "invoice",
        { type: "invoice", id },
      ],
    }),

    deleteInvoice: builder.mutation({
      query: (id) => ({
        url: `/invoices/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["invoice"],
    }),

    recordPayment: builder.mutation({
      query: ({ invoiceId, amount }: RecordPaymentParams) => ({
        url: `/invoices/${invoiceId}/payments`,
        method: "POST",
        body: { amount },
        credentials: "include",
      }),
      invalidatesTags: (result, error, { invoiceId }) => [
        "invoice",
        { type: "invoice", id: invoiceId },
      ],
    }),
  }),
});

export const {
  useGetInvoicesQuery,
  useGetInvoiceByIdQuery,
  useGetInvoiceWithItemsQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useRecordPaymentMutation,
} = invoiceApi;
