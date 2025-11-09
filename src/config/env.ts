export const env = {
  // Provide a safe default to avoid runtime errors during prerender/build
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "",
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NODE_ENV: process.env.NODE_ENV,
};
