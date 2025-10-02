import jwt from "jsonwebtoken";
import { APIGatewayProxyResult } from "aws-lambda";

import { getUserById } from "../utils/database";
import { unauthorized, internalServerError } from "../utils/responses";
import config from "../config/environment";
import { MiddyRequest, JWTPayload, AuthenticatedEvent } from "../types";

const authMiddleware = () => {
  return {
    before: async (
      request: MiddyRequest
    ): Promise<void | APIGatewayProxyResult> => {
      try {
        const authHeader =
          request.event.headers?.authorization ||
          request.event.headers?.Authorization;

        if (!authHeader) {
          throw new Error("No authorization header");
        }

        const token = authHeader.replace("Bearer ", "");

        if (!token) {
          throw new Error("No token provided");
        }

        const decoded = jwt.verify(
          token,
          config.security.jwtSecret
        ) as JWTPayload;

        const user = await getUserById(decoded.userId);

        if (!user) {
          throw new Error("User not found");
        }

        (request.event as AuthenticatedEvent).user = {
          userId: user.userId,
          email: user.email,
          username: user.username,
        };

        return;
      } catch (error: any) {
        console.error("Auth middleware error:", error.message);

        const response = unauthorized("Invalid or expired token");

        return response;
      }
    },

    onError: async (request: MiddyRequest): Promise<APIGatewayProxyResult> => {
      if (
        request.error &&
        "statusCode" in request.error &&
        request.error.statusCode === 401
      ) {
        return unauthorized("Authentication failed");
      }

      return internalServerError("Authentication error");
    },
  };
};

export default authMiddleware;
