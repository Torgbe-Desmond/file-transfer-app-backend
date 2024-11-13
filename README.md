## file-transfer-app-backend

A backend application designed for managing user authentication, directories, and file transfers. This application leverages **Express.js** for server management, **MongoDB** with **Mongoose** for data storage, **Firebase** for file storage, and includes middleware for enhanced security and error handling.

## Table of Contents

- [Project Details](#project-details)
- [Setup](#setup)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Routes Documentation](#api-routes-documentation)
  - [Authentication Routes](#authentication-routes)
  - [Directory Routes](#directory-routes)
  - [File Routes](#file-routes)
- [Scripts](#scripts)
- [Usage](#usage)
- [Testing](#testing)

### Project Details

| **Name**             | file-transfer-app-backend                                                                           |
|----------------------|-----------------------------------------------------------------------------------------------------|
| **Version**          | 1.0.0                                                                                               |
| **Main Entry Point** | server.js                                                                                           |
| **Description**      | A backend server to handle file transfer operations, directory management, and user authentication. |

### Setup

#### Prerequisites

- Node.js (v14 or later)
- MongoDB (local or MongoDB Atlas account)
- Firebase console
- npm or yarn

### Features

- User registration and authentication
- JWT-based secure authentication
- Protected routes for managing user files and directories
- File sharing functionality
- Creation, deletion, and updating folders
- Ability to move files between directories

### Scripts

| **Script Name** | **Description**                                                          | **Command** |
|-----------------|--------------------------------------------------------------------------|-------------|
| `start`         | Starts the server with Nodemon for automatic reloads during development. | `npm start` |

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/Torgbe-Desmond/file-transfer-app-backend.git
    cd file-transfer-app-backend
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory with the following variables:
    ```plaintext
    PORT=4000
    MONGO_DB_URL=your_mongodb_uri_key
    JWT_KEY=your_jwt_secret_key
    FIREBASE_API_KEY=your_firebase_api_key
    FIREBASE_AUTH_DOMAIN=your_firebase_domain_key
    FIREBASE_PROJECT_ID =your_firebase_project_id_key
    FIREBASE_STORAGE_BUCKET=your_firebase_bucket_key
    FIREBASE_MESSAGING_SENDER_ID=your_firebase_message_sender_id_key
    FIREBASE_APP_ID = your_firebase_app_id_key
    FIREBASE_MEASUREMENT_ID = your_firebase_measurement_id_key
    ```

4. Start the server:
    ```bash
    npm start
    ```

### Environment Variables

| **Variable**                      | **Description**                                                       |
|-----------------------------------|-----------------------------------------------------------------------|
| `PORT`                            | Port for the server (default 4000)                                    |
| `MONGO_URI`                       | MongoDB connection URI                                                |
| `JWT_SECRET`                      | Secret key for JWT token generation                                   |
| `FIREBASE_API_KEY`                | Firebase API key for authentication and other Firebase services       |
| `FIREBASE_AUTH_DOMAIN`            | Firebase authentication domain                                        |
| `FIREBASE_PROJECT_ID`             | Firebase project ID                                                   |
| `FIREBASE_STORAGE_BUCKET`         | Firebase storage bucket URL                                           |
| `FIREBASE_MESSAGING_SENDER_ID`    | Firebase messaging sender ID                                          |
| `FIREBASE_APP_ID`                 | Firebase application ID                                               |
| `FIREBASE_MEASUREMENT_ID`         | Firebase measurement ID for analytics                                 |
| `MONGO_DB_URL`                    | MongoDB connection URI for the application database                   |
| `JWT_KEY`                         | Secret key for JWT token generation                                   |

### API Routes Documentation

This application includes routes for **Authentication**, **Directory Management**, and **File Management**. Each section provides a summary of the routes, their methods, and purpose.

#### Authentication Routes

| **Route**            | **Method** | **Description**                          | **Protected** |
|----------------------|------------|------------------------------------------|---------------|
| `/login`             | POST       | Log in an existing user                  | No            |
| `/register`          | POST       | Register a new user                      | No            |
| `/delete`            | POST       | Delete the logged-in user                | Yes           |
| `/recovery`          | GET        | Send a recovery link via email           | No            |
| `/forgot-password`   | POST       | Reset password with a recovery token     | Yes           |
| `/all`               | GET        | Retrieve all registered users            | No            |

#### Directory Routes

| **Route**                                           | **Method** | **Description**                                  | **Protected** |
|-----------------------------------------------------|------------|--------------------------------------------------|---------------|
| `/:reference_Id/directories`                        | GET        | Retrieve all directories by reference ID         | Yes           |
| `/:reference_Id/directories/:directoryId`           | POST       | Create a new directory                           | Yes           |
| `/:reference_Id/directories/all`                    | GET        | Retrieve all directories for moving              | Yes           |
| `/delete-directory`                                 | DELETE     | Delete a specified directory                     | Yes           |
| `/:reference_Id/directories/:directoryId`           | GET        | Retrieve a specific directory                    | Yes           |
| `/:reference_Id/moveDirectories`                    | POST       | Move directories to a new location               | Yes           |
| `/:reference_Id/renameDirectory`                    | POST       | Rename a directory                               | Yes           |
| `/:reference_Id/share/:directoryId`                 | POST       | Share a specific directory                       | Yes           |
| `/:reference_Id/share`                              | POST       | Receive files shared to a directory              | Yes           |

#### File Routes

| **Route**                                                | **Method** | **Description**                                  | **Protected** |
|----------------------------------------------------------|------------|--------------------------------------------------|---------------|
| `/:reference_Id/directories/:directoryId/files`          | POST       | Upload files to a specific directory             | Yes           |
| `/:reference_Id/directories/:directoryId/files/subscription` | POST       | Upload files with subscription feature           | Yes           |
| `/delete-files`                                          | DELETE     | Delete multiple files                            | Yes           |
| `/:reference_Id/files/:fileId`                           | GET        | Retrieve a single file by file ID                | Yes           |
| `/:reference_Id/files`                                   | GET        | Retrieve all files associated with reference     | Yes           |
| `/:reference_Id/movefiles`                               | POST       | Move files to a different directory              | Yes           |
| `/download/:fileId`                                      | GET        | Download a file by file ID                       | Yes           |
