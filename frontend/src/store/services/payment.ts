import { storeApiConfig } from "../api-config";
import { Payment, PaymentMethod } from "@/utils/types/payment";

export interface PaymentCreateParams {
  invoiceId?: string;
  amount: number;
  paymentDate: string | Date;
  paymentMethod: PaymentMethod;
  remarks?: string;
}

export interface PaymentUpdateParams extends Partial<PaymentCreateParams> {
  id: string;
}

export const paymentApi = storeApiConfig.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query({
      query: (params) => ({
        url: "/payments",
        method: "GET",
        params,
        credentials: "include",
      }),
      providesTags: ["payment"],
      transformResponse: (response: { data: any[] }) => {
        return response.data.map((payment) => ({
          id: payment.id,
          invoiceId: payment.invoiceId,
          amount: Number(payment.amount),
          paymentDate: payment.paymentDate,
          paymentMethod: payment.paymentMethod,
          remarks: payment.remarks,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
        }));
      },
    }),

    getPaymentById: builder.query({
      query: (id) => ({
        url: `/payments/${id}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result, error, id) => [{ type: "payment", id }],
      transformResponse: (response: { data: any }) => ({
        id: response.data.id,
        invoiceId: response.data.invoiceId,
        amount: Number(response.data.amount),
        paymentDate: response.data.paymentDate,
        paymentMethod: response.data.paymentMethod,
        remarks: response.data.remarks,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
      }),
    }),

    createPayment: builder.mutation({
      query: (data: PaymentCreateParams) => ({
        url: "/payments",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["payment", "invoice"],
      transformResponse: (response: { data: any }) => ({
        id: response.data.id,
        invoiceId: response.data.invoiceId,
        amount: Number(response.data.amount),
        paymentDate: response.data.paymentDate,
        paymentMethod: response.data.paymentMethod,
        remarks: response.data.remarks,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
      }),
    }),

    updatePayment: builder.mutation({
      query: ({ id, ...data }: PaymentUpdateParams) => ({
        url: `/payments/${id}`,
        method: "PATCH",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: (result, error, { id }) => [
        "payment",
        { type: "payment", id },
        "invoice"
      ],
      transformResponse: (response: { data: any }) => ({
        id: response.data.id,
        invoiceId: response.data.invoiceId,
        amount: Number(response.data.amount),
        paymentDate: response.data.paymentDate,
        paymentMethod: response.data.paymentMethod,
        remarks: response.data.remarks,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
      }),
    }),

    deletePayment: builder.mutation({
      query: (id) => ({
        url: `/payments/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["payment", "invoice"],
    }),
  }),
});

export const {
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useDeletePaymentMutation,
} = paymentApi;