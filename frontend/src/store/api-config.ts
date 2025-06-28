import {
    BaseQueryFn,
    FetchArgs,
    FetchBaseQueryError,
    createApi,
    fetchBaseQuery,
  } from "@reduxjs/toolkit/query/react";
  import { IUser, setAuthUser } from "./reducers/auth.reducer";
  // import { setCurrentCompany } from './services/company/slice';
  
  interface ApiResponse {
    result?: {
      user?: IUser;
    };
  }
  
  const baseQuery = fetchBaseQuery({
    // baseUrl: import.meta.env.VITE_API_URL!,
    baseUrl: 'http://localhost:9052/v1',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
  
      // If we have a token set in state, let's assume that we should be passing it.
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
  
      return headers
    },
  });
  // const baseQueryWithReauth: BaseQueryFn<
  //   string | FetchArgs,
  //   ApiResponse | unknown,
  //   FetchBaseQueryError
  // > = async (args, api, extraOptions) => {
  //   let result = await baseQuery(args, api, extraOptions);
  //   if (result.error && result.error.status === 401) {
  //     const response = await baseQuery(
  //       {
  //         url: "/credentials/me",
  //         method: "POST",
  //         params: {},
  //         credentials: "include",
  //       },
  //       api,
  //       extraOptions
  //     );
  //     const { data }: { data?: ApiResponse } = response as { data?: ApiResponse };
  //     if (data) {
  //       api.dispatch(setAuthUser({ ...data.result, initializing: false }));
  //       result = await baseQuery(args, api, extraOptions);
  //     } else {
  //       console.log("logged out");
  //     }
  //   }
  //   return result;
  // };
  
  export const storeApiConfig = createApi({
    reducerPath: "api",
    baseQuery: baseQuery,
    tagTypes: [
      "notification",
      "leave",
      "company",
      "employee",
      "attendance",
      "getMe",
      "role",
      "refresh",
      "tags",
      "channel",
      "provider",
      "product",
      "invoice",
      "zone",
      "payment"
    ],
    endpoints: (builder) => ({
      getMe: builder.query({
        query: (data) => ({
          url: "/credentials/me",
          method: "GET",
          params: data,
          credentials: "include",
        }),
        async onQueryStarted(_, { queryFulfilled, dispatch }) {
          try {
            const { data } = await queryFulfilled;
            if (data?.result && "user" in data.result) {
              dispatch(setAuthUser({ ...data.result, isLoggedIn: true, initializing: false }));
            } else {
              dispatch(setAuthUser({ isLoggedIn: false, initializing: false }));
            }
          } catch (err) {
            console.log(err);
            dispatch(setAuthUser({ isLoggedIn: false, initializing: false }));
          }
        },
        providesTags: ["getMe"],
      }),
      // refresh: builder.query({
      //   query: (data) => ({
      //     url: "/credentials/me",
      //     method: "POST",
      //     params: data,
      //     credentials: "include",
      //   }),
      //   async onQueryStarted(_, { queryFulfilled, dispatch }) {
      //     const { data } = await queryFulfilled;
      //     if (data?.result && "user" in data.result) {
      //       dispatch(setAuthUser({ ...data.result, initializing: false }));
      //     } else {
      //       dispatch(setAuthUser({ initializing: false }));
      //     }
      //   },
      //   providesTags: ["refresh"],
      // }),
    }),
  });
  
  