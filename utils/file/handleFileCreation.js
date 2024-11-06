const mongoose = require('mongoose');

class HandleFileCreationHandler {
    constructor() {
        this.fileObject = {};
    }

    // Initialize a new session and start a transaction
    async startSession() {
        this.session = await mongoose.startSession();
        this.session.startTransaction();
    }

    // Commit and end session
    async commitTransaction() {
        await this.session.commitTransaction();
        this.session.endSession();
    }

    // Abort and end session
    async abortTransaction() {
        await this.session.abortTransaction();
        this.session.endSession();
    }

    // Method to handle file creation
    async handleFileCreation(file, File, user_id, uploadFile, directoryId) {
        await this.startSession();

        const { originalname:name, mimetype } = file;
        const fileNameWithoutExtension = name.split('.').slice(0, -1).join('.');
        const fileExists = await File.find({
            name: { $regex: `^${fileNameWithoutExtension}`, $options: 'i' }
        });

        let newFileObject;

        try {
            if (fileExists && fileExists.length > 0) {
                // Get the last file that belongs to the user
                const lastFileName = fileExists[fileExists.length - 1].name.split('.');
                const editedName = this.generateFileName(lastFileName);

                const url = await uploadFile(user_id, file, editedName);
                if (url) {
                    this.fileObject = {
                        name: editedName,
                        mimetype,
                        url,
                        directoryId,
                        user_id
                    };
                    const newFile = await File.create([this.fileObject], { session: this.session });
                    newFileObject = this.extractFileObject(newFile);
                }
            } else {
                const url = await uploadFile(user_id, file, name);
                if (url) {
                    this.fileObject = {
                        name,
                        mimetype,
                        url,
                        directoryId,
                        user_id,
                    };
                    const newFile = await File.create([this.fileObject], { session: this.session });
                    newFileObject = this.extractFileObject(newFile);
                }
            }

            // Commit transaction if everything is successful
            await this.commitTransaction();

        } catch (error) {
            await this.abortTransaction();
            throw error;
        }

        return newFileObject;
    }

    extractFileObject(file) {
        return file[0];
    }
    

    generateFileName(splitedName) {
        let name, extension, editedName;

        if (splitedName && splitedName.length === 2) {
            name = splitedName[0];
            extension = splitedName[1];
            editedName = `${name}.1.${extension}`;
        } else if (splitedName && splitedName.length > 2) {
            name = splitedName[0];
            let currentNumberOfFilesWithSimilarName = splitedName[1];
            let incrementedNumber = parseInt(currentNumberOfFilesWithSimilarName) + 1;
            extension = splitedName[2];
            editedName = `${name}.${incrementedNumber}.${extension}`;
        }

        return editedName;
    }
}

module.exports = HandleFileCreationHandler;
