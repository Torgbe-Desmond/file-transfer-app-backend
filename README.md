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

