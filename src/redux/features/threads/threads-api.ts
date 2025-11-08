import { apiSlice } from "@/redux/api-slice";

export interface Thread {
  _id: string;
  title: string;
  content: string;
  user: {
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateThreadRequest {
  title: string;
  content: string;
}

export interface CreateThreadResponse {
  status: string;
  message: string;
  data: Thread;
}

export interface GetThreadsResponse {
  status: string;
  data: {
    threads: Thread[];
  };
  pagination: {
    totalItems: number;
    currentPage: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface GetSingleThreadResponse {
  status: string;
  data: Thread;
}

export interface GetThreadsParams {
  page?: number;
  limit?: number;
  search?: string;
}

const threadsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createThread: builder.mutation<CreateThreadResponse, CreateThreadRequest>({
      query: (body) => ({
        url: "/threads",
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["threads"],
    }),
    getThreads: builder.query<GetThreadsResponse, GetThreadsParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();

        // Add page (default: 1)
        const page = params?.page || 1;
        queryParams.append("page", page.toString());

        // Add limit (default: 10)
        const limit = params?.limit || 10;
        queryParams.append("limit", limit.toString());

        // Add search only if provided
        if (params?.search && params.search.trim() !== "") {
          queryParams.append("search", params.search.trim());
        }

        return {
          url: `/threads?${queryParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["threads"],
    }),
    getSingleThread: builder.query<GetSingleThreadResponse, string>({
      query: (id) => ({
        url: `/threads/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "threads", id }],
    }),
  }),
});

export default threadsApi;

export const {
  useCreateThreadMutation,
  useGetThreadsQuery,
  useGetSingleThreadQuery,
} = threadsApi;
