export const isLocalEnvironment = process.env.STAGE === "local";
export const isLiveEnvironment = process.env.STAGE === "live";

export const CORSConfig = {
  credentials: true,
  origins: [
    "https://yourcustomdomain.com",
    "https://www.yourcustomdomain.com"
  ],
};
