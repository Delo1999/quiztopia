import { APIGatewayProxyResult } from "aws-lambda";
import { StandardResponse, ResponseBuilder } from "../types";

//standardized HTTP response
const createResponse = <T = any>(
  statusCode: number,
  body: StandardResponse<T>,
  headers: Record<string, string> = {}
): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      ...headers,
    },
    body: JSON.stringify(body),
  };
};

//Response builder with type safety
export const responses: ResponseBuilder = {
  success: <T>(data: T, message: string = "Success"): APIGatewayProxyResult => {
    return createResponse(200, {
      success: true,
      message,
      data,
    });
  },

  created: <T>(
    data: T,
    message: string = "Created successfully"
  ): APIGatewayProxyResult => {
    return createResponse(201, {
      success: true,
      message,
      data,
    });
  },

  badRequest: (
    message: string = "Bad request",
    errors?: string[]
  ): APIGatewayProxyResult => {
    return createResponse(400, {
      success: false,
      message,
      ...(errors && { errors }),
    });
  },

  unauthorized: (message: string = "Unauthorized"): APIGatewayProxyResult => {
    return createResponse(401, {
      success: false,
      message,
    });
  },

  forbidden: (message: string = "Forbidden"): APIGatewayProxyResult => {
    return createResponse(403, {
      success: false,
      message,
    });
  },

  notFound: (message: string = "Not found"): APIGatewayProxyResult => {
    return createResponse(404, {
      success: false,
      message,
    });
  },

  conflict: (message: string = "Conflict"): APIGatewayProxyResult => {
    return createResponse(409, {
      success: false,
      message,
    });
  },

  internalServerError: (
    message: string = "Internal server error"
  ): APIGatewayProxyResult => {
    return createResponse(500, {
      success: false,
      message,
    });
  },
};

// For backward compatibility, also export individual functions
export const {
  success,
  created,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  internalServerError,
} = responses;
