# Cooperate GPT

Cooperate GPT is an AI-powered platform that allows users to interact with various AI models, generate content, and manage their queries. It consists of a Node.js backend and a Next.js frontend.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running the Application](#running-the-application)
6. [Features](#features)
7. [API Documentation](#api-documentation)
8. [Project Structure](#project-structure)
9. [Data Aggregation and Retrieval](#data-aggregation-and-retrieval)
10. [Contributing](#contributing)
11. [License](#license)

## Prerequisites

Ensure you have the following installed:

- Node.js (v14 or later)
- npm (v6 or later)
- MongoDB (v4 or later)
- Git

## Installation

1. Clone the repository: `git clone https://github.com/your-username/cooperate-gpt.git
cd cooperate-gpt  `

2. Install backend dependencies: `cd backend
npm install  `

3. Install frontend dependencies: `cd ../app
npm install  `

## Backend Setup

Follow these steps to set up the backend of Cooperate GPT:

1. Navigate to the backend directory: `cd backend  `

2. Create a `.env` file in the backend directory with the following variables: `PORT=1999
MONGODB_URI=mongodb://localhost:27017/cooperate_gpt
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_EMAIL=your_smtp_email
SMTP_PASSWORD=your_smtp_password
FROM_EMAIL=noreply@cooperategpt.com
FROM_NAME=Cooperate GPT  `

3. Set up MongoDB:

   - Install MongoDB on your system if you haven't already
   - Start the MongoDB service
   - The application will create the necessary collections automatically on first run

4. Set up the project structure:

   - Ensure the following directories exist in the `backend` folder: `backend/
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
└── uploads/    `
   - If any are missing, create them manually

5. Configure the server:

   - Open `server.js` and ensure all necessary middleware and routes are properly set up
   - Check that the MongoDB connection is correctly configured

6. Set up API routes:

   - In the `routes` directory, create or modify route files for different API endpoints (e.g., `authRoutes.js`, `queryRoutes.js`, etc.)
   - Ensure all routes are properly imported and used in `server.js`

7. Implement controllers:

   - In the `controllers` directory, create or modify controller files to handle the business logic for each route
   - Make sure error handling is implemented using the `asyncHandler` middleware and `ErrorResponse` utility

8. Set up models:

   - In the `models` directory, define Mongoose schemas for your data models (e.g., `User.js`, `AIModel.js`, `Query.js`)

9. Configure middleware:

   - In the `middleware` directory, set up any custom middleware (e.g., authentication middleware, error handling middleware)

10. Implement utility functions:

    - In the `utils` directory, create any helper functions or utilities needed across the application

11. Set up Swagger documentation:

    - Ensure `swagger.js` is properly configured to generate API documentation
    - Add Swagger annotations to your routes and models

12. Test the backend:
    - Start the server by running: `npm run dev     `
    - Use a tool like Postman or curl to test your API endpoints
    - Ensure all routes are working as expected and proper error handling is in place

## Frontend Setup

1. Navigate to the frontend directory: `cd app  `

2. Create a `.env.local` file in the frontend directory with the following variables: `NEXT_PUBLIC_BACKEND_URL=http://localhost:1999
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key  `

## Running the Application

1. Start the backend server: `cd backend
npm run dev  `

2. In a new terminal, start the frontend development server: `cd app
npm run dev  `

3. Access the application at `http://localhost:3000`

## Features

- User authentication (sign up, login, password reset)
- AI model management (create, list, and use models)
- Content generation using AI models
- Chat history and management
- File upload and processing
- Dashboard for analytics and usage statistics

## API Documentation

The backend API is documented using Swagger. Access the documentation at:

http://localhost:1999/api-docs
