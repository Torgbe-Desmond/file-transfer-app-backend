Project Setup
To set up and run this project locally:

Clone the repository:
git clone <repository-url>

Install the dependencies:
npm install
Set up the environment variables as described in the Environment Variables section.

Run the project:
npm start

Environment Variables
Ensure you create a .env file in the root directory and include the following variables:
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
MONGO_DB_URL=your_mongo_db_url
JWT_KEY=your_jwt_secret_key

Database Models
1. User
Stores user information such as username, email, password, reference_Id, and role.
2. Student
Holds student-specific data like studentName, indexNumber, studentNumber and reference_Id.
3. Directory
Organizes files and folders into directories, with references to subDirectories, files, and comments.
4. File
Stores file details like originalname, url, directoryId, user_id, mimetype, and size.
5. Comment
Allows users to add comments on specific directories.

API Endpoints
Authentication Routes
Method	Endpoint	Description	Protected
POST	/auth/login	Logs in a user	No
POST	/auth/register	Registers a new user	No
POST	/auth/student-login	Logs in a student	No
POST	/auth/delete	Deletes a user	Yes
GET	/auth/recovery	Sends account recovery email	No
POST	/auth/forgot-password	Sends a forgot password link	Yes
GET	/auth/all	Fetches all users	No
Comment Routes
Method	Endpoint	Description	Protected
POST	/comment/:reference_Id/send	Adds a new comment	Yes
GET	/comment/:reference_Id/:directoryId/get-comment	Fetches all comments for a specific directory	Yes
Directory Routes
Method	Endpoint	Description	Protected
GET	/directory/:reference_Id/directories	Retrieves all directories	Yes
GET	/directory/student/:reference_Id/directories	Retrieves the student's main directory	Yes
POST	/directory/:reference_Id/directories/:directoryId	Creates a new directory in the specified folder	Yes
GET	/directory/:reference_Id/directories/all	Retrieves all directories available for moving files	Yes
DELETE	/directory/delete-directory	Deletes a specific directory	Yes
GET	/directory/:reference_Id/directories/:directoryId	Retrieves a specific directory by ID	Yes
GET	/directory/student/:reference_Id/directories/:directoryId	Fetches a student's directory by ID	Yes
POST	/directory/:reference_Id/moveDirectories	Moves directories	Yes
POST	/directory/:reference_Id/renameDirectory	Renames a directory	Yes
File Routes
Method	Endpoint	Description	Protected
POST	/file/:reference_Id/directories/:directoryId/stuff	Uploads files to a directory	Yes
DELETE	/file/delete-files	Deletes specific files	Yes
GET	/file/:reference_Id/stuff	Fetches all files for a user	Yes
POST	/file/:reference_Id/movefiles	Moves files between directories	Yes
GET	/file/download/:fileId	Downloads a file	Yes