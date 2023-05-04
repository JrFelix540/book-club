interface Configuration {
  DATABASE_URL: string;
  JWT_SECRET: string;
  PORT: string;
  MODE: string;
}

let globalConfig: Configuration;

export const getEnvironmentVariables = (): Configuration => {
  if (globalConfig) {
    return globalConfig;
  }

  const newConfig: Configuration = {
    DATABASE_URL:
      process.env.DATABASE_URL ||
      "postgres://postgres:postgres@127.0.0.1:5432/bookclub",
    JWT_SECRET: process.env.JWT_SECRET || "qid",
    PORT: process.env.PORT || "4000",
    MODE: process.env.MODE || "development",
  };

  globalConfig = newConfig;

  return globalConfig;
};
