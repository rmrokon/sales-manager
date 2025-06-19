import { storeApiConfig } from "../api-config";

export const authApi = storeApiConfig.injectEndpoints({
  endpoints: (builder) => ({
    getChannels: builder.query({
      query: (data) => ({
        url: "/channels",
        method: "GET",
        params: data,
        credentials: "include",
      }),
      providesTags: ["channel"],
      // async onQueryStarted(_, { queryFulfilled }) {
      //   const { data } = await queryFulfilled;
      //   console.log(data);
      // },
    }),

    createChannel: builder.mutation({
      query: (data) => ({
        url: "/channels",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["channel"],
      // async onQueryStarted(_, { queryFulfilled }) {
      //   const { data } = await queryFulfilled;
      //   console.log(data);
      // },
    }),
    updateChannel: builder.mutation({
      query: (data) => ({
        url: `/channels/${data.id}`,
        method: "PATCH",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["channel"],
      // async onQueryStarted(_, { queryFulfilled }) {
      //   const { data } = await queryFulfilled;
      //   console.log(data);
      // },
    }),
    deleteChannel: builder.mutation({
      query: (data) => ({
        url: `/channels/${data.id}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["channel"],
      // async onQueryStarted(_, { queryFulfilled }) {
      //   const { data } = await queryFulfilled;
      //   console.log(data);
      // },
    }),
  }),
});

export const {
  useCreateChannelMutation,
  useGetChannelsQuery,
  useDeleteChannelMutation,
  useUpdateChannelMutation
} = authApi;

