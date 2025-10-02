import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { getQuizById, getLeaderboardByQuizId } from "../../utils/database";
import {
  success,
  badRequest,
  notFound,
  internalServerError,
} from "../../utils/responses";

export const getLeaderboardHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const quizId = event.pathParameters?.quizId;
    const limitParam = event.queryStringParameters?.limit;
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    if (!quizId) {
      return badRequest("Quiz ID is required");
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
      return badRequest("Limit must be a number between 1 and 100");
    }

    const quiz = await getQuizById(quizId);

    if (!quiz) {
      return notFound("Quiz not found");
    }

    const leaderboard = await getLeaderboardByQuizId(quizId, limit);

    const response = {
      quizId,
      quizName: quiz.quizName,
      leaderboard: leaderboard.map((entry, index) => ({
        position: index + 1,
        userId: entry.userId,
        username: entry.username,
        score: entry.score,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      })),
    };

    return success(response, "Leaderboard retrieved successfully");
  } catch (error: any) {
    console.error("Get leaderboard error:", {
      message: error.message,
      quizId: event.pathParameters?.quizId,
      timestamp: new Date().toISOString(),
    });

    return internalServerError("Failed to retrieve leaderboard");
  }
};
