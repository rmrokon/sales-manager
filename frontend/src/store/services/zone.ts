import { storeApiConfig } from "../api-config";

export interface ZoneCreateParams {
  name: string;
  company_id: string;
}

export interface ZoneUpdateParams {
  name?: string;
  company_id?: string;
}

export const zoneApi = storeApiConfig.injectEndpoints({
  endpoints: (builder) => ({
    getZones: builder.query({
      query: (params) => ({
        url: "/zones",
        method: "GET",
        params,
        credentials: "include",
      }),
      providesTags: ["zone"],
    }),

    getZoneById: builder.query({
      query: (id) => ({
        url: `/zones/${id}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result, error, id) => [{ type: "zone", id }],
    }),

    createZone: builder.mutation({
      query: (data: ZoneCreateParams) => ({
        url: "/zones",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["zone"],
    }),

    updateZone: builder.mutation({
      query: ({ zoneId, ...data }: { zoneId: string } & ZoneUpdateParams) => ({
        url: `/zones/${zoneId}`,
        method: "PATCH",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: (result, error, { zoneId }) => [
        "zone",
        { type: "zone", id: zoneId },
      ],
    }),

    deleteZone: builder.mutation({
      query: (zoneId) => ({
        url: `/zones/${zoneId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["zone"],
    }),
  }),
});

export const {
  useGetZonesQuery,
  useGetZoneByIdQuery,
  useCreateZoneMutation,
  useUpdateZoneMutation,
  useDeleteZoneMutation,
} = zoneApi;