# Quiztopia - Serverless Quiz Application

A modern, type-safe serverless quiz application built with TypeScript, AWS Lambda, DynamoDB, and API Gateway using the Serverless Framework. Users can create accounts, build quizzes with geo-located questions, and compete on leaderboards.

## Features

- **User Authentication**: Registration and login with JWT tokens
- **Quiz Management**: Create, view, and delete quizzes
- **Question Management**: Add questions with geographic coordinates to quizzes
- **Public Quiz Listing**: Browse all available quizzes with creator information
- **Protected Quiz Access**: Authentication required to view quiz questions
- **Leaderboard System**: Track and display top scores for each quiz
- **Score Registration**: Submit scores and compete with other players
- **Comprehensive IAM Policy**: Precisely defined permissions for DynamoDB access

## Technology Stack

- **TypeScript**: Type-safe development with compile-time error checking
- **Serverless Framework**: Infrastructure as Code
- **AWS Lambda**: Serverless compute
- **API Gateway**: HTTP API endpoints
- **DynamoDB**: NoSQL database with GSI indexes
- **JWT**: Authentication tokens
- **Middy**: Middleware engine for Lambda
- **bcryptjs**: Password hashing
- **ESLint**: Code linting and formatting

### Users Table

- **Primary Key**: `userId` (String)
- **GSI**: `EmailIndex` on `email`
- **Attributes**: userId, email, username, password, createdAt

### Quizzes Table

- **Primary Key**: `quizId` (String)
- **GSI**: `CreatedByIndex` on `createdBy`
- **Attributes**: quizId, quizName, description, createdBy, createdAt

### Questions Table

- **Primary Key**: `questionId` (String)
- **GSI**: `QuizIdIndex` on `quizId`
- **Attributes**: questionId, quizId, question, answer, longitude, latitude, createdAt

### Leaderboard Table

- **Primary Key**: `leaderboardId` (String, format: `quizId#userId`)
- **GSI**: `QuizIdScoreIndex` on `quizId` and `score` (sorted descending)
- **Attributes**: leaderboardId, quizId, userId, username, score, createdAt

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login

### Quiz Management

- `GET /quiz` - Get all quizzes (public)
- `GET /quiz/{quizId}` - Get specific quiz with questions (requires auth)
- `POST /quiz` - Create new quiz (requires auth)
- `DELETE /quiz/{quizId}` - Delete quiz (requires auth, owner only)

### Question Management

- `POST /quiz/{quizId}/question` - Add question to quiz (requires auth, owner only)

### Leaderboard

- `POST /quiz/{quizId}/score` - Register score (requires auth)
- `GET /quiz/{quizId}/leaderboard` - Get leaderboard (public)

## Setup and Deployment

### Prerequisites

- Node.js 20.x
- AWS CLI configured
- Serverless Framework CLI

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set environment variables (optional):

```bash
export JWT_SECRET="your-super-secret-jwt-key"
```

### Deployment

Deploy to AWS:

```bash
serverless deploy
```

Deploy to specific stage:

```bash
serverless deploy --stage prod
```

### Local Development

Start local development server:

```bash
serverless dev
```

## API Usage Examples

### Register User

```bash
curl -X POST https://your-api-url/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "username": "testuser"
  }'
```

### Login

```bash
curl -X POST https://your-api-url/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create Quiz

```bash
curl -X POST https://your-api-url/quiz \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "quizName": "Geography Quiz",
    "description": "Test your geography knowledge"
  }'
```

### Add Question

```bash
curl -X POST https://your-api-url/quiz/QUIZ_ID/question \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "question": "What is the capital of Sweden?",
    "answer": "Stockholm",
    "longitude": 18.0686,
    "latitude": 59.3293
  }'
```

### Register Score

```bash
curl -X POST https://your-api-url/quiz/QUIZ_ID/score \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "score": 85
  }'
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Authorization**: Users can only modify their own resources
- **Input Validation**: Comprehensive validation for all inputs
- **Coordinate Validation**: Geographic coordinates validation
- **CORS**: Cross-origin resource sharing enabled

## IAM Policy

The application uses a comprehensive IAM policy that grants precise permissions:

- DynamoDB operations (Query, Scan, GetItem, PutItem, UpdateItem, DeleteItem)
- Access to all application tables and their indexes
- No overly broad permissions

## Error Handling

All endpoints return standardized JSON responses:

```json
{
  "success": boolean,
  "message": "string",
  "data": object | null,
  "errors": object | null
}
```

HTTP Status Codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 500: Internal Server Error

## Environment Variables

- `USERS_TABLE`: DynamoDB users table name
- `QUIZZES_TABLE`: DynamoDB quizzes table name
- `QUESTIONS_TABLE`: DynamoDB questions table name
- `LEADERBOARD_TABLE`: DynamoDB leaderboard table name
- `JWT_SECRET`: Secret key for JWT signing

## Development Notes

- All coordinates are validated to be within valid longitude (-180 to 180) and latitude (-90 to 90) ranges
- Leaderboard entries are automatically sorted by score in descending order
- Quiz deletion cascades to remove all related questions and leaderboard entries
- User passwords are hashed with bcrypt using 10 salt rounds
- JWT tokens expire after 24 hours
