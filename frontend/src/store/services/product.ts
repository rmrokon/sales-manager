import { storeApiConfig } from "../api-config";

export const productApi = storeApiConfig.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (data) => ({
        url: "/products",
        method: "GET",
        params: data,
        credentials: "include",
      }),
      providesTags: ["product"],
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
    }),

    createProduct: builder.mutation({
      query: (data) => ({
        url: "/products",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["product"],
    }),

    updateProduct: builder.mutation({
      query: ({ productId, ...data }) => ({
        url: `/products/${productId}`,
        method: "PATCH",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["product"],
    }),

    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `/products/${productId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["product"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation
} = productApi;