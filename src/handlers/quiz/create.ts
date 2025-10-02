import { APIGatewayProxyResult, Context } from "aws-lambda";
import { createQuiz } from "../../utils/database";
import {
  created,
  badRequest,
  internalServerError,
} from "../../utils/responses";
import { validateQuiz } from "../../utils/validation";
import {
  AuthenticatedEvent,
  QuizCreationInput,
  QuizResponse,
} from "../../types";

export const createQuizHandler = async (
  event: AuthenticatedEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const quizData =
      typeof event.body === "string"
        ? JSON.parse(event.body)
        : event.body || {};
    const userId = event.user?.userId;
    const username = event.user?.username;

    const validation = validateQuiz(quizData);
    if (!validation.isValid) {
      return badRequest("Validation failed", validation.errors);
    }

    const { quizName, description } = quizData;

    const quizInput: QuizCreationInput = {
      quizName,
      description,
      createdBy: userId || "",
      createdByUsername: username || "",
    };

    const createdQuizData = await createQuiz(quizInput);

    const response: QuizResponse = {
      quizId: createdQuizData.quizId,
      quizName: createdQuizData.quizName,
      description: createdQuizData.description,
      createdBy: createdQuizData.createdBy,
      createdByUsername: createdQuizData.createdByUsername,
      createdAt: createdQuizData.createdAt,
      questionCount: createdQuizData.questionCount,
    };

    return created(response, "Quiz created successfully");
  } catch (error: any) {
    console.error("Create quiz error:", {
      message: error.message,
      userId: event.user?.userId,
      quizName: (() => {
        try {
          const body =
            typeof event.body === "string"
              ? JSON.parse(event.body)
              : event.body;
          return body?.quizName;
        } catch {
          return undefined;
        }
      })(),
      timestamp: new Date().toISOString(),
    });

    return internalServerError("Failed to create quiz");
  }
};
