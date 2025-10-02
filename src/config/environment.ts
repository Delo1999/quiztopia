import { Config } from "../types";

const config: Config = {
  aws: {
    region: process.env.AWS_REGION || "eu-north-1",
    tables: {
      users:
        process.env.USERS_TABLE ||
        `quiztopia-users-${process.env.NODE_ENV || "dev"}`,
      quizzes:
        process.env.QUIZZES_TABLE ||
        `quiztopia-quizzes-${process.env.NODE_ENV || "dev"}`,
      questions:
        process.env.QUESTIONS_TABLE ||
        `quiztopia-questions-${process.env.NODE_ENV || "dev"}`,
      leaderboard:
        process.env.LEADERBOARD_TABLE ||
        `quiztopia-leaderboard-${process.env.NODE_ENV || "dev"}`,
    },
  },

  security: {
    jwtSecret: process.env.JWT_SECRET || "dev-secret-change-in-production",
    jwtExpiration: process.env.JWT_EXPIRATION || "24h",
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10"),
  },

  api: {
    corsOrigin: process.env.CORS_ORIGIN || "*",
    rateLimit: parseInt(process.env.API_RATE_LIMIT || "100"),
  },

  app: {
    nodeEnv: process.env.NODE_ENV || "development",
    logLevel: process.env.LOG_LEVEL || "info",
  },
};

const validateConfig = (): void => {
  const errors: string[] = [];

  if (config.app.nodeEnv === "production") {
    if (config.security.jwtSecret === "dev-secret-change-in-production") {
      errors.push("JWT_SECRET must be set in production");
    }

    if (config.security.jwtSecret.length < 32) {
      errors.push("JWT_SECRET must be at least 32 characters long");
    }

    if (config.api.corsOrigin === "*") {
      errors.push("CORS_ORIGIN should be restricted in production");
    }
  }

  if (!config.aws.tables.users) {
    errors.push("USERS_TABLE environment variable is required");
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join("\n")}`);
  }
};

validateConfig();

export default config;
