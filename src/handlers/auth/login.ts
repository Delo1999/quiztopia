import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import config from "../../config/environment";
import { getUserByEmail } from "../../utils/database";
import {
  success,
  badRequest,
  unauthorized,
  internalServerError,
} from "../../utils/responses";
import { validateUserLogin } from "../../utils/validation";
import { ERROR_MESSAGES } from "../../constants/validation";
import { AuthResponse, JWTPayload } from "../../types";

export const loginHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const loginData =
      typeof event.body === "string"
        ? JSON.parse(event.body)
        : event.body || {};

    const validation = validateUserLogin(loginData);
    if (!validation.isValid) {
      return badRequest("Validation failed", validation.errors);
    }

    const { email, password } = loginData;

    const user = await getUserByEmail(email.toLowerCase());

    const isValidPassword = user
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user || !isValidPassword) {
      return unauthorized(ERROR_MESSAGES.auth.loginFailed);
    }

    const tokenPayload: JWTPayload = {
      userId: user.userId,
      email: user.email,
      username: user.username,
    };

    const token = jwt.sign(tokenPayload, config.security.jwtSecret);

    const response: AuthResponse = {
      user: {
        userId: user.userId,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
      token,
    };

    return success(response, "Login successful");
  } catch (error: any) {
    console.error("Login error:", {
      message: error.message,
      email: (() => {
        try {
          if (typeof event.body === "string") {
            return JSON.parse(event.body)?.email;
          } else if (
            event.body &&
            typeof event.body === "object" &&
            "email" in event.body
          ) {
            return (event.body as { email?: string }).email;
          }
          return undefined;
        } catch {
          return undefined;
        }
      })(),
      timestamp: new Date().toISOString(),
    });

    return internalServerError("Failed to login");
  }
};
