import dotenv from "dotenv";

dotenv.config({ path: "src/.env" });

interface Config {
  PORT: string | undefined;

  THREEKIT_ENV: string | undefined;
  THREEKIT_BEARER_TOKEN: string | undefined;
  THREEKIT_ORG_ID: string | undefined;
}

const config: Config = {
  PORT: process.env.PORT,

  THREEKIT_ENV: process.env.THREEKIT_ENV,
  THREEKIT_BEARER_TOKEN: process.env.THREEKIT_BEARER_TOKEN,
  THREEKIT_ORG_ID: process.env.THREEKIT_ORG_ID,
};

export default config;
