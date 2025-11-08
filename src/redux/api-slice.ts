import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "./base-query";

export const apiSlice = createApi({
  baseQuery: baseQuery,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  tagTypes: ["profile", "threads", "posts", "notifications"],
  endpoints: () => ({}),
});
