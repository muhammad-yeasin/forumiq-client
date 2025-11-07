import { apiSlice } from "@/redux/api-slice";

const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    signupByEmail: builder.mutation({
      query: (body) => ({
        url: "/auth/signup",
        method: "POST",
        body: body,
      }),
    }),
  }),
});

export default authApi;

export const { useSignupByEmailMutation } = authApi;
