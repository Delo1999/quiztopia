import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

// ========================================
// CORE TYPES
// ========================================

export interface Config {
  aws: {
    region: string;
    tables: {
      users: string;
      quizzes: string;
      questions: string;
      leaderboard: string;
    };
  };
  security: {
    jwtSecret: string;
    jwtExpiration: string;
    bcryptSaltRounds: number;
  };
  api: {
    corsOrigin: string;
    rateLimit: number;
  };
  app: {
    nodeEnv: string;
    logLevel: string;
  };
}

// ========================================
// DATABASE ENTITIES
// ========================================

export interface User {
  userId: string;
  email: string;
  username: string;
  password: string;
  createdAt: string;
  isActive?: boolean;
  emailVerified?: boolean;
}

export interface Quiz {
  quizId: string;
  quizName: string;
  description: string;
  createdBy: string;
  createdByUsername: string;
  createdAt: string;
  updatedAt: string;
  questionCount: number;
  isActive: boolean;
  isPublic?: boolean;
}

export interface Question {
  questionId: string;
  quizId: string;
  question: string;
  answer: string;
  longitude: number;
  latitude: number;
  createdAt: string;
  createdBy: string;
  isActive: boolean;
  difficulty?: "easy" | "medium" | "hard";
  points?: number;
}

export interface LeaderboardEntry {
  leaderboardId: string;
  quizId: string;
  userId: string;
  username: string;
  score: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

// ========================================
// INPUT/OUTPUT TYPES
// ========================================

export interface UserRegistrationInput {
  email: string;
  username: string;
  hashedPassword: string;
}

export interface UserLoginInput {
  email: string;
  password: string;
}

export interface QuizCreationInput {
  quizName: string;
  description?: string;
  createdBy: string;
  createdByUsername: string;
}

export interface QuestionCreationInput {
  quizId: string;
  question: string;
  answer: string;
  longitude: number;
  latitude: number;
  createdBy: string;
  difficulty?: "easy" | "medium" | "hard";
  points?: number;
}

export interface ScoreCreationInput {
  quizId: string;
  userId: string;
  username: string;
  score: number;
}

// ========================================
// API REQUEST/RESPONSE TYPES
// ========================================

export interface AuthenticatedEvent extends APIGatewayProxyEvent {
  user?: {
    userId: string;
    email: string;
    username: string;
  };
}

export interface StandardResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface UserResponse {
  userId: string;
  email: string;
  username: string;
  createdAt: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

export interface QuizResponse {
  quizId: string;
  quizName: string;
  description: string;
  createdBy: string;
  createdByUsername: string;
  createdAt: string;
  questionCount: number;
  questions?: Question[];
}

export interface LeaderboardResponse {
  quizId: string;
  quizName: string;
  totalEntries: number;
  leaderboard: Array<{
    rank: number;
    username: string;
    score: number;
    createdAt: string;
  }>;
}

// ========================================
// VALIDATION TYPES
// ========================================

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  regex?: RegExp;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationRules {
  user: {
    email: ValidationRule;
    password: ValidationRule;
    username: ValidationRule;
  };
  quiz: {
    name: ValidationRule;
    description: ValidationRule;
  };
  question: {
    text: ValidationRule;
    answer: ValidationRule;
    coordinates: {
      longitude: ValidationRule;
      latitude: ValidationRule;
    };
  };
  leaderboard: {
    score: ValidationRule;
  };
}

export interface ErrorMessages {
  user: {
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
    passwordTooShort: string;
    usernameRequired: string;
    usernameTooShort: string;
    usernameInvalid: string;
  };
  quiz: {
    nameRequired: string;
    nameTooShort: string;
  };
  question: {
    textRequired: string;
    answerRequired: string;
    coordinatesRequired: string;
    coordinatesInvalid: string;
  };
  leaderboard: {
    scoreRequired: string;
    scoreInvalid: string;
  };
  auth: {
    unauthorized: string;
    forbidden: string;
    loginFailed: string;
  };
  general: {
    notFound: string;
    internalError: string;
  };
}

// ========================================
// HANDLER TYPES
// ========================================

export type Handler = (
  event: APIGatewayProxyEvent,
  context: Context
) => Promise<APIGatewayProxyResult>;

export type AuthenticatedHandler = (
  event: AuthenticatedEvent,
  context: Context
) => Promise<APIGatewayProxyResult>;

// ========================================
// DATABASE OPERATION TYPES
// ========================================

export interface DatabaseOperations {
  // User operations
  createUser(userData: UserRegistrationInput): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(userId: string): Promise<User | undefined>;

  // Quiz operations
  createQuiz(quizData: QuizCreationInput): Promise<Quiz>;
  getAllQuizzes(): Promise<Quiz[]>;
  getQuizById(quizId: string): Promise<Quiz | undefined>;
  deleteQuiz(quizId: string): Promise<void>;

  // Question operations
  createQuestion(questionData: QuestionCreationInput): Promise<Question>;
  getQuestionsByQuizId(quizId: string): Promise<Question[]>;

  // Leaderboard operations
  createOrUpdateScore(scoreData: ScoreCreationInput): Promise<LeaderboardEntry>;
  getLeaderboardByQuizId(
    quizId: string,
    limit?: number
  ): Promise<LeaderboardEntry[]>;
}

// ========================================
// MIDDLEWARE TYPES
// ========================================

export interface MiddyRequest {
  event: APIGatewayProxyEvent;
  context: Context;
  response?: APIGatewayProxyResult;
  error?: Error;
}

export interface AuthMiddleware {
  before(request: MiddyRequest): Promise<void>;
  onError(request: MiddyRequest): Promise<APIGatewayProxyResult>;
}

// ========================================
// UTILITY TYPES
// ========================================

export type ResponseBuilder = {
  success<T>(data: T, message?: string): APIGatewayProxyResult;
  created<T>(data: T, message?: string): APIGatewayProxyResult;
  badRequest(message?: string, errors?: string[]): APIGatewayProxyResult;
  unauthorized(message?: string): APIGatewayProxyResult;
  forbidden(message?: string): APIGatewayProxyResult;
  notFound(message?: string): APIGatewayProxyResult;
  conflict(message?: string): APIGatewayProxyResult;
  internalServerError(message?: string): APIGatewayProxyResult;
};

// ========================================
// JWT TYPES
// ========================================

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}
