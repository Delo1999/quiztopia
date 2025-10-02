import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import cors from "@middy/http-cors";
import httpErrorHandler from "@middy/http-error-handler";
import authMiddleware from "./middleware/auth";
import { registerHandler } from "./handlers/auth/register";
import { loginHandler } from "./handlers/auth/login";
import { createQuizHandler } from "./handlers/quiz/create";
import { getAllQuizzesHandler } from "./handlers/quiz/getAll";
import { getQuizByIdHandler } from "./handlers/quiz/getById";
import { deleteQuizHandler } from "./handlers/quiz/delete";
import { createQuestionHandler } from "./handlers/question/create";
import { registerScoreHandler } from "./handlers/leaderboard/registerScore";
import { getLeaderboardHandler } from "./handlers/leaderboard/get";
import { Handler } from "./types";

const createHandler = (
  handler: Handler,
  requireAuth: boolean = false,
  needsJsonParser: boolean = true
): middy.MiddyfiedHandler => {
  const middlewares = [];

  // Only add JSON body parser for requests that need it (POST, PUT, etc.)
  if (needsJsonParser) {
    middlewares.push(
      jsonBodyParser({
        disableContentTypeError: true, // Allow requests without proper content-type
      })
    );
  }

  middlewares.push(
    cors({
      origin: process.env.CORS_ORIGIN || "*",
      credentials: false,
    }),
    httpErrorHandler({
      logger: console.error,
    })
  );

  if (requireAuth) {
    middlewares.push(authMiddleware() as any);
  }

  return middy(handler).use(middlewares);
};

// Authentication endpoints (public) - need JSON parser for POST requests
export const register = createHandler(registerHandler, false, true);
export const login = createHandler(loginHandler, false, true);

// Quiz endpoints
export const createQuiz = createHandler(
  createQuizHandler as Handler,
  true,
  true
); // Protected - create quiz (POST)
export const getAllQuizzes = createHandler(getAllQuizzesHandler, false, false); // Public - get all quizzes (GET - no JSON parser needed)
export const getQuiz = createHandler(
  getQuizByIdHandler as Handler,
  true,
  false
); // Protected - get specific quiz (GET - no JSON parser needed)
export const deleteQuiz = createHandler(
  deleteQuizHandler as Handler,
  true,
  false
); // Protected - delete quiz (DELETE - no JSON parser needed)

// Question endpoints
export const addQuestion = createHandler(
  createQuestionHandler as Handler,
  true,
  true
); // Protected - add question (POST)

// Leaderboard endpoints
export const registerScore = createHandler(
  registerScoreHandler as Handler,
  true,
  true
); // Protected - register score (POST)
export const getLeaderboard = createHandler(
  getLeaderboardHandler,
  false,
  false
); // Public - get leaderboard (GET - no JSON parser needed)
