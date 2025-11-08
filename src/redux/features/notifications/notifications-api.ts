import { apiSlice } from "@/redux/api-slice";

export interface Notification {
  _id: string;
  user: string;
  thread: string;
  post: string | null;
  type: "posted" | "replied";
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
}

export interface GetNotificationsResponse {
  status: string;
  message: string;
  pagination: {
    totalItems: number;
    currentPage: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  data: {
    notifications: Notification[];
  };
}

const notificationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      GetNotificationsResponse,
      GetNotificationsParams
    >({
      query: ({ page = 1, limit = 10 }) => {
        const queryParams = new URLSearchParams();
        queryParams.append("page", page.toString());
        queryParams.append("limit", limit.toString());
        return {
          url: `/notifications?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["notifications"],
    }),
  }),
});

export default notificationsApi;

export const { useGetNotificationsQuery } = notificationsApi;
