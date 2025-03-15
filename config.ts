export const config = {
  jwtSecret: (process.env.JWT_SECRET as string) || "supersecret",
};

export default config;
