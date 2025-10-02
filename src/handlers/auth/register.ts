import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import config from "../../config/environment";
import { createUser, getUserByEmail } from "../../utils/database";
import {
  created,
  badRequest,
  conflict,
  internalServerError,
} from "../../utils/responses";
import { validateUserRegistration } from "../../utils/validation";
import { AuthResponse, UserRegistrationInput, JWTPayload } from "../../types";

export const registerHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userData =
      typeof event.body === "string"
        ? JSON.parse(event.body)
        : event.body || {};

    const validation = validateUserRegistration(userData);
    if (!validation.isValid) {
      return badRequest("Validation failed", validation.errors);
    }

    const { email, password, username } = userData;

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return conflict("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(
      password,
      config.security.bcryptSaltRounds
    );

    const userInput: UserRegistrationInput = {
      email,
      username,
      hashedPassword,
    };

    const createdUserData = await createUser(userInput);

    //Generate JWT token (business logic stays in handler)
    const tokenPayload: JWTPayload = {
      userId: createdUserData.userId,
      email: createdUserData.email,
      username: createdUserData.username,
    };

    const token = jwt.sign(tokenPayload, config.security.jwtSecret);

    const response: AuthResponse = {
      user: {
        userId: createdUserData.userId,
        email: createdUserData.email,
        username: createdUserData.username,
        createdAt: createdUserData.createdAt,
      },
      token,
    };

    return created(response, "User registered successfully");
  } catch (error: any) {
    console.error("Registration error:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });

    if (error.name === "ConditionalCheckFailedException") {
      return conflict("User already exists");
    }

    return internalServerError("Failed to register user");
  }
};
