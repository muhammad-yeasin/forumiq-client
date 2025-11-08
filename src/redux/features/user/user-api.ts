import { apiSlice } from "@/redux/api-slice";

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
}

export interface UpdateProfileResponse {
  status: string;
  message?: string;
  data?: {
    user?: Record<string, unknown>;
    accessToken?: string;
  };
}

const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    updateProfile: builder.mutation<
      UpdateProfileResponse,
      UpdateProfileRequest
    >({
      query: (body) => ({
        url: "/users/profile",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["profile"],
    }),
  }),
});

export default userApi;
export const { useUpdateProfileMutation } = userApi;
