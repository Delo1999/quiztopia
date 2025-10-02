import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import config from "../config/environment";
import {
  User,
  Quiz,
  Question,
  LeaderboardEntry,
  UserRegistrationInput,
  QuizCreationInput,
  QuestionCreationInput,
  ScoreCreationInput,
  DatabaseOperations,
} from "../types";

const client = new DynamoDBClient({
  region: config.aws.region,
});

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: false,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

const handleDatabaseError = (operation: string, error: any): never => {
  console.error(`Database operation failed: ${operation}`, {
    error: error.message,
    code: error.name,
    timestamp: new Date().toISOString(),
  });
  throw error;
};

// ========================================
// USER OPERATIONS
// ========================================

const createUser = async (userData: UserRegistrationInput): Promise<User> => {
  try {
    const user: User = {
      userId: uuidv4(),
      email: userData.email.toLowerCase(),
      username: userData.username,
      password: userData.hashedPassword,
      createdAt: new Date().toISOString(),
      isActive: true,
      emailVerified: false,
    };

    const command = new PutCommand({
      TableName: config.aws.tables.users,
      Item: user,
      ConditionExpression: "attribute_not_exists(userId)",
    });

    await docClient.send(command);
    return user;
  } catch (error) {
    handleDatabaseError("createUser", error);
    throw error; // This line will never be reached, but satisfies TypeScript
  }
};

const getUserByEmail = async (email: string): Promise<User | undefined> => {
  try {
    const command = new QueryCommand({
      TableName: config.aws.tables.users,
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email.toLowerCase(),
      },
    });

    const result = await docClient.send(command);
    return result.Items?.[0] as User | undefined;
  } catch (error) {
    handleDatabaseError("getUserByEmail", error);
    return undefined; // This line will never be reached, but satisfies TypeScript
  }
};

const getUserById = async (userId: string): Promise<User | undefined> => {
  try {
    const command = new GetCommand({
      TableName: config.aws.tables.users,
      Key: { userId },
    });

    const result = await docClient.send(command);
    return result.Item as User | undefined;
  } catch (error) {
    handleDatabaseError("getUserById", error);
    return undefined; // This line will never be reached, but satisfies TypeScript
  }
};

// ========================================
// QUIZ OPERATIONS
// ========================================

const createQuiz = async (quizData: QuizCreationInput): Promise<Quiz> => {
  try {
    const quiz: Quiz = {
      quizId: uuidv4(),
      quizName: quizData.quizName.trim(),
      description: quizData.description ? quizData.description.trim() : "",
      createdBy: quizData.createdBy,
      createdByUsername: quizData.createdByUsername,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questionCount: 0,
      isActive: true,
      isPublic: true,
    };

    const command = new PutCommand({
      TableName: config.aws.tables.quizzes,
      Item: quiz,
    });

    await docClient.send(command);
    return quiz;
  } catch (error) {
    handleDatabaseError("createQuiz", error);
    throw error; // This line will never be reached, but satisfies TypeScript
  }
};

const getAllQuizzes = async (): Promise<Quiz[]> => {
  try {
    const command = new ScanCommand({
      TableName: config.aws.tables.quizzes,
      FilterExpression: "isActive = :isActive",
      ExpressionAttributeValues: {
        ":isActive": true,
      },
      ProjectionExpression:
        "quizId, quizName, createdBy, createdAt, description, questionCount",
    });

    const result = await docClient.send(command);
    return (result.Items || []) as Quiz[];
  } catch (error) {
    handleDatabaseError("getAllQuizzes", error);
    return []; // This line will never be reached, but satisfies TypeScript
  }
};

const getQuizById = async (quizId: string): Promise<Quiz | undefined> => {
  try {
    const command = new GetCommand({
      TableName: config.aws.tables.quizzes,
      Key: { quizId },
    });

    const result = await docClient.send(command);
    return result.Item as Quiz | undefined;
  } catch (error) {
    handleDatabaseError("getQuizById", error);
    return undefined; // This line will never be reached, but satisfies TypeScript
  }
};

const deleteQuiz = async (quizId: string): Promise<void> => {
  try {
    const command = new DeleteCommand({
      TableName: config.aws.tables.quizzes,
      Key: { quizId },
    });

    await docClient.send(command);
  } catch (error) {
    handleDatabaseError("deleteQuiz", error);
  }
};

// ========================================
// QUESTION OPERATIONS
// ========================================

const createQuestion = async (
  questionData: QuestionCreationInput
): Promise<Question> => {
  try {
    const question: Question = {
      questionId: uuidv4(),
      quizId: questionData.quizId,
      question: questionData.question.trim(),
      answer: questionData.answer.trim(),
      longitude: parseFloat(questionData.longitude.toString()),
      latitude: parseFloat(questionData.latitude.toString()),
      createdAt: new Date().toISOString(),
      createdBy: questionData.createdBy,
      isActive: true,
      difficulty: questionData.difficulty || "medium",
      points: questionData.points || 10,
    };

    const command = new PutCommand({
      TableName: config.aws.tables.questions,
      Item: question,
    });

    await docClient.send(command);
    return question;
  } catch (error) {
    handleDatabaseError("createQuestion", error);
    throw error; // This line will never be reached, but satisfies TypeScript
  }
};

const getQuestionsByQuizId = async (quizId: string): Promise<Question[]> => {
  try {
    const command = new QueryCommand({
      TableName: config.aws.tables.questions,
      IndexName: "QuizIdIndex",
      KeyConditionExpression: "quizId = :quizId",
      FilterExpression: "isActive = :isActive",
      ExpressionAttributeValues: {
        ":quizId": quizId,
        ":isActive": true,
      },
    });

    const result = await docClient.send(command);
    return (result.Items || []) as Question[];
  } catch (error) {
    handleDatabaseError("getQuestionsByQuizId", error);
    return []; // This line will never be reached, but satisfies TypeScript
  }
};

const deleteQuestionsByQuizId = async (quizId: string): Promise<void> => {
  try {
    const questions = await getQuestionsByQuizId(quizId);

    const deletePromises = questions.map((question) => {
      const command = new DeleteCommand({
        TableName: config.aws.tables.questions,
        Key: { questionId: question.questionId },
      });
      return docClient.send(command);
    });

    await Promise.all(deletePromises);
  } catch (error) {
    handleDatabaseError("deleteQuestionsByQuizId", error);
  }
};

// ========================================
// LEADERBOARD OPERATIONS
// ========================================

const createOrUpdateScore = async (
  scoreData: ScoreCreationInput
): Promise<LeaderboardEntry> => {
  try {
    const scoreEntry: LeaderboardEntry = {
      leaderboardId: `${scoreData.quizId}#${scoreData.userId}`,
      quizId: scoreData.quizId,
      userId: scoreData.userId,
      username: scoreData.username,
      score: parseInt(scoreData.score.toString()),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    };

    const command = new PutCommand({
      TableName: config.aws.tables.leaderboard,
      Item: scoreEntry,
    });

    await docClient.send(command);
    return scoreEntry;
  } catch (error) {
    handleDatabaseError("createOrUpdateScore", error);
    throw error; // This line will never be reached, but satisfies TypeScript
  }
};

const getLeaderboardByQuizId = async (
  quizId: string,
  limit: number = 10
): Promise<LeaderboardEntry[]> => {
  try {
    const command = new QueryCommand({
      TableName: config.aws.tables.leaderboard,
      IndexName: "QuizIdScoreIndex",
      KeyConditionExpression: "quizId = :quizId",
      FilterExpression: "isActive = :isActive",
      ExpressionAttributeValues: {
        ":quizId": quizId,
        ":isActive": true,
      },
      ScanIndexForward: false, // Descending order (highest scores first)
      Limit: limit,
    });

    const result = await docClient.send(command);
    return (result.Items || []) as LeaderboardEntry[];
  } catch (error) {
    handleDatabaseError("getLeaderboardByQuizId", error);
    return []; // This line will never be reached, but satisfies TypeScript
  }
};

const deleteLeaderboardByQuizId = async (quizId: string): Promise<void> => {
  try {
    const command = new QueryCommand({
      TableName: config.aws.tables.leaderboard,
      IndexName: "QuizIdScoreIndex",
      KeyConditionExpression: "quizId = :quizId",
      ExpressionAttributeValues: {
        ":quizId": quizId,
      },
    });

    const result = await docClient.send(command);
    const entries = (result.Items || []) as LeaderboardEntry[];

    const deletePromises = entries.map((entry) => {
      const deleteCommand = new DeleteCommand({
        TableName: config.aws.tables.leaderboard,
        Key: { leaderboardId: entry.leaderboardId },
      });
      return docClient.send(deleteCommand);
    });

    await Promise.all(deletePromises);
  } catch (error) {
    handleDatabaseError("deleteLeaderboardByQuizId", error);
  }
};

// ========================================
// EXPORTED DATABASE OPERATIONS
// ========================================

export const database: DatabaseOperations = {
  // User operations
  createUser,
  getUserByEmail,
  getUserById,

  // Quiz operations
  createQuiz,
  getAllQuizzes,
  getQuizById,
  deleteQuiz,

  // Question operations
  createQuestion,
  getQuestionsByQuizId,

  // Leaderboard operations
  createOrUpdateScore,
  getLeaderboardByQuizId,
};

// For backward compatibility, also export individual functions
export {
  createUser,
  getUserByEmail,
  getUserById,
  createQuiz,
  getAllQuizzes,
  getQuizById,
  deleteQuiz,
  createQuestion,
  getQuestionsByQuizId,
  deleteQuestionsByQuizId,
  createOrUpdateScore,
  getLeaderboardByQuizId,
  deleteLeaderboardByQuizId,
};
