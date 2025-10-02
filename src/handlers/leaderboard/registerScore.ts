import { APIGatewayProxyResult } from "aws-lambda";

import { getQuizById, createOrUpdateScore } from "../../utils/database";
import {
  created,
  badRequest,
  notFound,
  internalServerError,
} from "../../utils/responses";
import { validateScore } from "../../utils/validation";
import { AuthenticatedEvent, ScoreCreationInput } from "../../types";

export const registerScoreHandler = async (
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const quizId = event.pathParameters?.quizId;
    const scoreData =
      typeof event.body === "string"
        ? JSON.parse(event.body)
        : event.body || {};
    const userId = event.user?.userId;
    const username = event.user?.username;

    if (!quizId) {
      return badRequest("Quiz ID is required");
    }

    const quiz = await getQuizById(quizId);

    if (!quiz) {
      return notFound("Quiz not found");
    }

    const validation = validateScore(scoreData);
    if (!validation.isValid) {
      return badRequest("Validation failed", validation.errors);
    }

    const { score } = scoreData;

    const scoreInput: ScoreCreationInput = {
      quizId,
      userId: userId || "",
      username: username || "",
      score,
    };

    const registeredScore = await createOrUpdateScore(scoreInput);

    const response = {
      leaderboardId: registeredScore.leaderboardId,
      quizId: registeredScore.quizId,
      userId: registeredScore.userId,
      username: registeredScore.username,
      score: registeredScore.score,
      createdAt: registeredScore.createdAt,
      updatedAt: registeredScore.updatedAt,
    };

    return created(response, "Score registered successfully");
  } catch (error: any) {
    console.error("Register score error:", {
      message: error.message,
      userId: event.user?.userId,
      quizId: event.pathParameters?.quizId,
      timestamp: new Date().toISOString(),
    });

    return internalServerError("Failed to register score");
  }
};
