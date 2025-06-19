import { storeApiConfig } from "../api-config";

export const authApi = storeApiConfig.injectEndpoints({
  endpoints: (builder) => ({
    getCompanies: builder.query({
      query: (data) => ({
        url: "/companies",
        method: "GET",
        params: data,
        credentials: "include",
      }),
      providesTags: ["company"],
      // async onQueryStarted(_, { queryFulfilled }) {
      //   const { data } = await queryFulfilled;
      //   console.log(data);
      // },
    }),

    createCompany: builder.mutation({
      query: (data) => ({
        url: "/companies",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["company"],
      // async onQueryStarted(_, { queryFulfilled }) {
      //   const { data } = await queryFulfilled;
      //   console.log(data);
      // },
    }),
  }),
});

export const {
  useGetCompaniesQuery,
  useCreateCompanyMutation
} = authApi;

