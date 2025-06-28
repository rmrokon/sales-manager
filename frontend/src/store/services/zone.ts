import { storeApiConfig } from "../api-config";

export interface Zone {
  id: string;
  name: string;
  company_id: string;
  createdAt?: string;
  updatedAt?: string;
}

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
      transformResponse: (response: { data: any[] }) => {
        return response.data.map((zone) => ({
          id: zone.id,
          name: zone.name,
          company_id: zone.company_id,
          createdAt: zone.createdAt,
          updatedAt: zone.updatedAt,
        }));
      },
    }),

    getZoneById: builder.query({
      query: (id) => ({
        url: `/zones/${id}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result, error, id) => [{ type: "zone", id }],
      transformResponse: (response: { data: any }) => ({
        id: response.data.id,
        name: response.data.name,
        company_id: response.data.company_id,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
      }),
    }),

    createZone: builder.mutation({
      query: (data: ZoneCreateParams) => ({
        url: "/zones",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["zone"],
      transformResponse: (response: { data: any }) => ({
        id: response.data.id,
        name: response.data.name,
        company_id: response.data.company_id,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
      }),
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
      transformResponse: (response: { data: any }) => ({
        id: response.data.id,
        name: response.data.name,
        company_id: response.data.company_id,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
      }),
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
