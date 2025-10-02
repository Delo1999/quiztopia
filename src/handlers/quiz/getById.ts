import { APIGatewayProxyResult } from "aws-lambda";
import { getQuizById, getQuestionsByQuizId } from "../../utils/database";
import {
  success,
  notFound,
  badRequest,
  internalServerError,
} from "../../utils/responses";
import { AuthenticatedEvent } from "../../types";

export const getQuizByIdHandler = async (
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const { userId, quizId } = event.pathParameters || {};

    if (!userId) {
      return badRequest("User ID is required");
    }

    if (!quizId) {
      return badRequest("Quiz ID is required");
    }

    const quiz = await getQuizById(quizId);

    if (!quiz) {
      return notFound("Quiz not found");
    }

    if (quiz.createdBy !== userId) {
      return notFound(
        "Quiz not found or you don't have permission to access it"
      );
    }

    const questions = await getQuestionsByQuizId(quizId);

    const response = {
      ...quiz,
      questions: questions.map((q) => ({
        questionId: q.questionId,
        question: q.question,
        answer: q.answer,
        longitude: q.longitude,
        latitude: q.latitude,
        difficulty: q.difficulty,
        points: q.points,
      })),
    };

    return success(response, "Quiz retrieved successfully");
  } catch (error: any) {
    console.error("Get quiz error:", {
      message: error.message,
      userId: event.pathParameters?.userId,
      quizId: event.pathParameters?.quizId,
      timestamp: new Date().toISOString(),
    });

    return internalServerError("Failed to retrieve quiz");
  }
};
