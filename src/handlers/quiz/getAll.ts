import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getAllQuizzes } from "../../utils/database";
import { success, internalServerError } from "../../utils/responses";

export const getAllQuizzesHandler = async (
  _event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const quizzes = await getAllQuizzes();

    return success(quizzes, "Quizzes retrieved successfully");
  } catch (error: any) {
    console.error("Get all quizzes error:", {
      message: error.message,
      timestamp: new Date().toISOString(),
    });

    return internalServerError("Failed to retrieve quizzes");
  }
};
