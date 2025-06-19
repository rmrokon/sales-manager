import { storeApiConfig } from "../api-config";
import { setAuthUser } from "../reducers/auth.reducer";

export const authApi = storeApiConfig.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (data) => ({
        url: "/credentials",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        const { data } = await queryFulfilled;
        console.log(data);
      },
    }),

    login: builder.mutation({
      query: (data) => ({
        url: "/credentials/login",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        const { data } = await queryFulfilled;
        if (data?.result && "user" in data.result) {
          localStorage.setItem('accessToken', data.result.accessToken);
          dispatch(setAuthUser({ ...data.result, isLoggedIn: true, initializing: false }));
        } else {
          dispatch(setAuthUser({ isLoggedIn: false, initializing: false }));
        }
      },
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/credentials/me",
        method: "DELETE",
        credentials: "include",
      }),
      async onQueryStarted(_, { queryFulfilled, dispatch }) {
        await queryFulfilled;
        dispatch(
          setAuthUser({
            user: null,
            roles: [],
            permissions: [],
            company: null,
            initializing: false,
          })
        );
      },
    }),

    switchCompany: builder.mutation({
      query: (data) => ({
        url: "/credentials/switch-company",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        await queryFulfilled;
      },
      invalidatesTags: [
        "notification",
        "leave",
        "company",
        "employee",
        "attendance",
        "getMe",
      ],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useSwitchCompanyMutation,
} = authApi;

