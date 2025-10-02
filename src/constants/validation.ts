import { ValidationRules, ErrorMessages } from "../types";

export const VALIDATION_RULES: ValidationRules = {
  user: {
    email: {
      regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      maxLength: 255,
      required: true,
    },
    password: {
      minLength: 6,
      maxLength: 128,
      required: true,
    },
    username: {
      minLength: 3,
      maxLength: 50,
      required: true,
    },
  },

  quiz: {
    name: {
      minLength: 3,
      maxLength: 100,
      required: true,
    },
    description: {
      maxLength: 500,
      required: false,
    },
  },

  question: {
    text: {
      minLength: 10,
      maxLength: 500,
      required: true,
    },
    answer: {
      minLength: 1,
      maxLength: 200,
      required: true,
    },
    coordinates: {
      longitude: {
        min: -180,
        max: 180,
        required: true,
      },
      latitude: {
        min: -90,
        max: 90,
        required: true,
      },
    },
  },

  leaderboard: {
    score: {
      min: 0,
      max: Number.MAX_SAFE_INTEGER,
      required: true,
    },
  },
};

export const ERROR_MESSAGES: ErrorMessages = {
  user: {
    emailRequired: "Email is required",
    emailInvalid: "Invalid email format",
    passwordRequired: "Password is required",
    passwordTooShort: `Password must be at least ${VALIDATION_RULES.user.password.minLength} characters long`,
    usernameRequired: "Username is required",
    usernameTooShort: `Username must be at least ${VALIDATION_RULES.user.username.minLength} characters long`,
    usernameInvalid:
      "Username can only contain letters, numbers, hyphens, and underscores",
  },

  quiz: {
    nameRequired: "Quiz name is required",
    nameTooShort: `Quiz name must be at least ${VALIDATION_RULES.quiz.name.minLength} characters long`,
  },

  question: {
    textRequired: "Question text is required",
    answerRequired: "Answer is required",
    coordinatesRequired: "Longitude and latitude coordinates are required",
    coordinatesInvalid:
      "Invalid coordinates. Longitude must be between -180 and 180, latitude between -90 and 90",
  },

  leaderboard: {
    scoreRequired: "Score is required",
    scoreInvalid: "Score must be a non-negative number",
  },

  auth: {
    unauthorized: "Invalid or expired token",
    forbidden: "Access denied",
    loginFailed: "Invalid email or password",
  },

  general: {
    notFound: "Resource not found",
    internalError: "Internal server error occurred",
  },
};
