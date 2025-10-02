import { ValidationRule, ValidationResult } from "../types";
import { VALIDATION_RULES, ERROR_MESSAGES } from "../constants/validation";

const validateField = (
  value: any,
  rules: ValidationRule,
  fieldName: string
): string | null => {
  if (
    rules.required &&
    (value === undefined || value === null || value === "")
  ) {
    return (
      (ERROR_MESSAGES.user as any)[`${fieldName}Required`] ||
      `${fieldName} is required`
    );
  }

  if (!rules.required && (!value || value === "")) {
    return null;
  }

  if (typeof value === "string") {
    if (rules.minLength && value.length < rules.minLength) {
      return (
        (ERROR_MESSAGES.user as any)[`${fieldName}TooShort`] ||
        `${fieldName} must be at least ${rules.minLength} characters long`
      );
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `${fieldName} must be no more than ${rules.maxLength} characters long`;
    }

    if (rules.regex && !rules.regex.test(value)) {
      return (
        (ERROR_MESSAGES.user as any)[`${fieldName}Invalid`] ||
        `${fieldName} format is invalid`
      );
    }
  }

  if (typeof value === "number") {
    if (rules.min !== undefined && value < rules.min) {
      return `${fieldName} must be at least ${rules.min}`;
    }

    if (rules.max !== undefined && value > rules.max) {
      return `${fieldName} must be no more than ${rules.max}`;
    }
  }

  return null;
};

export const validateUserRegistration = (userData: {
  email?: string;
  password?: string;
  username?: string;
}): ValidationResult => {
  const { email, password, username } = userData || {};
  const errors: string[] = [];

  const emailError = validateField(email, VALIDATION_RULES.user.email, "email");
  if (emailError) errors.push(emailError);

  const passwordError = validateField(
    password,
    VALIDATION_RULES.user.password,
    "password"
  );
  if (passwordError) errors.push(passwordError);

  const usernameError = validateField(
    username,
    VALIDATION_RULES.user.username,
    "username"
  );
  if (usernameError) errors.push(usernameError);

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateUserLogin = (userData: {
  email?: string;
  password?: string;
}): ValidationResult => {
  const { email, password } = userData || {};
  const errors: string[] = [];

  if (!email) errors.push(ERROR_MESSAGES.user.emailRequired);
  if (!password) errors.push(ERROR_MESSAGES.user.passwordRequired);

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateQuiz = (quizData: {
  quizName?: string;
  description?: string;
}): ValidationResult => {
  const { quizName, description } = quizData || {};
  const errors: string[] = [];

  const nameError = validateField(quizName, VALIDATION_RULES.quiz.name, "name");
  if (nameError) errors.push(nameError);

  if (description) {
    const descError = validateField(
      description,
      VALIDATION_RULES.quiz.description,
      "description"
    );
    if (descError) errors.push(descError);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateQuestion = (questionData: {
  question?: string;
  answer?: string;
  longitude?: number;
  latitude?: number;
}): ValidationResult => {
  const { question, answer, longitude, latitude } = questionData || {};
  const errors: string[] = [];

  const questionError = validateField(
    question,
    VALIDATION_RULES.question.text,
    "text"
  );
  if (questionError) errors.push(questionError);

  const answerError = validateField(
    answer,
    VALIDATION_RULES.question.answer,
    "answer"
  );
  if (answerError) errors.push(answerError);

  if (longitude === undefined || latitude === undefined) {
    errors.push(ERROR_MESSAGES.question.coordinatesRequired);
  } else {
    const lonError = validateField(
      longitude,
      VALIDATION_RULES.question.coordinates.longitude,
      "longitude"
    );
    if (lonError) errors.push(lonError);

    const latError = validateField(
      latitude,
      VALIDATION_RULES.question.coordinates.latitude,
      "latitude"
    );
    if (latError) errors.push(latError);

    if (typeof longitude !== "number" || typeof latitude !== "number") {
      errors.push("Coordinates must be numbers");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateScore = (scoreData: {
  score?: number;
}): ValidationResult => {
  const { score } = scoreData || {};
  const errors: string[] = [];

  if (score === undefined || score === null) {
    errors.push(ERROR_MESSAGES.leaderboard.scoreRequired);
  } else if (typeof score !== "number" || score < 0) {
    errors.push(ERROR_MESSAGES.leaderboard.scoreInvalid);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
