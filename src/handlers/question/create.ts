import { APIGatewayProxyResult } from "aws-lambda";
import { getQuizById, createQuestion } from "../../utils/database";
import {
  created,
  badRequest,
  notFound,
  forbidden,
  internalServerError,
} from "../../utils/responses";
import { validateQuestion } from "../../utils/validation";
import { AuthenticatedEvent, QuestionCreationInput } from "../../types";

export const createQuestionHandler = async (
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const quizId = event.pathParameters?.quizId;
    const questionData =
      typeof event.body === "string"
        ? JSON.parse(event.body)
        : event.body || {};
    const userId = event.user?.userId;

    if (!quizId) {
      return badRequest("Quiz ID is required");
    }

    const quiz = await getQuizById(quizId);

    if (!quiz) {
      return notFound("Quiz not found");
    }

    if (quiz.createdBy !== userId) {
      return forbidden("You can only add questions to your own quizzes");
    }

    const validation = validateQuestion(questionData);
    if (!validation.isValid) {
      return badRequest("Validation failed", validation.errors);
    }

    const { question, answer, longitude, latitude, difficulty, points } =
      questionData;

    const questionInput: QuestionCreationInput = {
      quizId,
      question,
      answer,
      longitude,
      latitude,
      createdBy: userId,
      difficulty: difficulty || "medium",
      points: points || 10,
    };

    const createdQuestion = await createQuestion(questionInput);

    const response = {
      questionId: createdQuestion.questionId,
      quizId: createdQuestion.quizId,
      question: createdQuestion.question,
      answer: createdQuestion.answer,
      longitude: createdQuestion.longitude,
      latitude: createdQuestion.latitude,
      difficulty: createdQuestion.difficulty,
      points: createdQuestion.points,
      createdAt: createdQuestion.createdAt,
    };

    return created(response, "Question created successfully");
  } catch (error: any) {
    console.error("Create question error:", {
      message: error.message,
      userId: event.user?.userId,
      quizId: event.pathParameters?.quizId,
      timestamp: new Date().toISOString(),
    });

    return internalServerError("Failed to create question");
  }
};
