import { APIGatewayProxyResult } from "aws-lambda";
import {
  getQuizById,
  deleteQuiz,
  deleteQuestionsByQuizId,
  deleteLeaderboardByQuizId,
} from "../../utils/database";
import {
  success,
  notFound,
  forbidden,
  badRequest,
  internalServerError,
} from "../../utils/responses";
import { AuthenticatedEvent } from "../../types";

export const deleteQuizHandler = async (
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const quizId = event.pathParameters?.quizId;
    const userId = event.user?.userId;

    if (!quizId) {
      return badRequest("Quiz ID is required");
    }

    const quiz = await getQuizById(quizId);

    if (!quiz) {
      return notFound("Quiz not found");
    }

    if (quiz.createdBy !== userId) {
      return forbidden("You can only delete your own quizzes");
    }

    await Promise.all([
      deleteQuestionsByQuizId(quizId),
      deleteLeaderboardByQuizId(quizId),
      deleteQuiz(quizId),
    ]);

    return success(null, "Quiz deleted successfully");
  } catch (error: any) {
    console.error("Delete quiz error:", {
      message: error.message,
      userId: event.user?.userId,
      quizId: event.pathParameters?.quizId,
      timestamp: new Date().toISOString(),
    });

    return internalServerError("Failed to delete quiz");
  }
};
