export const config = {
  jwtSecret: (process.env.JWT_SECRET as string) || "supersecret",
  port: (process.env.PORT as string) || 4000,
};

export default config;

