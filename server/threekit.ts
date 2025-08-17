// ThreekitServices.ts
import axios from "axios";
import config from "../config";
import * as winston from "winston";
import "winston-daily-rotate-file";

const threekitLogger = winston.createLogger({
  level: "silly",
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.DailyRotateFile({
      filename: "logs/services/threekit-%DATE%.log",
      datePattern: "YYYY-MM",
      maxFiles: "30d",
      level: "silly",
    }),
  ],
});

class ThreekitServices {
  private readonly bearerToken: string;
  private readonly orgId: string;
  private readonly threekitEnv: string;

  constructor() {
    this.bearerToken = config.THREEKIT_BEARER_TOKEN;
    this.orgId = config.THREEKIT_ORG_ID;
    this.threekitEnv = config.THREEKIT_ENV;
  }

  async requestCaching(params: {
    assetId: string;
    stageId: string;
    configuration: Record<string, any>;
    width?: number;
    height?: number;
    display?: string;
  }) {
    const {
      assetId,
      stageId,
      configuration,
      width = 1200,
      height = 1200,
      display = "image",
    } = params;

    const url = `https://${this.threekitEnv}.threekit.com/api/fast-compositor/`;

    const configUrlParams = new URLSearchParams({
      bearer_token: this.bearerToken,
      assetId,
      orgId: this.orgId,
      stageId,
      configuration: JSON.stringify(configuration),
      stageConfiguration: JSON.stringify({
        "Camera Position": 1,
      }),
      display,
      width: width.toString(),
      height: height.toString(),
      cacheKey: "23",
    });

    const fullUrl = `${url}?${configUrlParams.toString()}`;
    threekitLogger.info(`[requestCaching] Requesting: ${fullUrl}`);

    try {
      const response = await axios.get(fullUrl);
      threekitLogger.info(
        `[requestCaching] Response status: ${response.status}`
      );
      return response.data;
    } catch (error: any) {
      threekitLogger.error(`[requestCaching] Error: ${error?.message}`);
      throw error;
    }
  }
}

export default ThreekitServices;
