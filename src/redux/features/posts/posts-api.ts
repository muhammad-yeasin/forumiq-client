import { apiSlice } from "@/redux/api-slice";

export interface Post {
  _id: string;
  user: {
    username: string;
  };
  thread: string;
  parent: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  moderation: {
    isSpam: boolean;
    isInappropriate: boolean;
    reason: string;
  };
  children: Post[];
}

export interface CreatePostRequest {
  thread: string;
  parent?: string;
  content: string;
}

export interface CreatePostResponse {
  status: string;
  message: string;
  data: {
    post: Post;
  };
}

export interface GetPostsResponse {
  status: string;
  message: string;
  data: {
    posts: Post[];
  };
}

const postsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPost: builder.mutation<CreatePostResponse, CreatePostRequest>({
      query: (body) => ({
        url: "/posts",
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["posts"],
    }),
    getPosts: builder.query<GetPostsResponse, string>({
      query: (threadId) => ({
        url: `/posts/${threadId}`,
        method: "GET",
      }),
      providesTags: ["posts"],
    }),
  }),
});

export default postsApi;

export const { useCreatePostMutation, useGetPostsQuery } = postsApi;
