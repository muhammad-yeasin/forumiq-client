import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { RootState } from "./store";
import { env } from "@/config/env";

export const baseQuery = fetchBaseQuery({
  baseUrl: env.API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth?.accessToken;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});
