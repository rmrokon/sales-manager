import { storeApiConfig } from "../api-config";

export const providerApi = storeApiConfig.injectEndpoints({
  endpoints: (builder) => ({
    getProviders: builder.query({
      query: (data) => ({
        url: "/providers",
        method: "GET",
        params: data,
        credentials: "include",
      }),
      providesTags: ["provider"],
    }),

    createProvider: builder.mutation({
      query: (data) => ({
        url: "/providers",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["provider"],
    }),

    updateProvider: builder.mutation({
      query: ({ providerId, ...data }) => ({
        url: `/providers/${providerId}`,
        method: "PATCH",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["provider"],
    }),

    deleteProvider: builder.mutation({
      query: (providerId) => ({
        url: `/providers/${providerId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["provider"],
    }),
  }),
});

export const {
  useGetProvidersQuery,
  useCreateProviderMutation,
  useUpdateProviderMutation,
  useDeleteProviderMutation
} = providerApi;