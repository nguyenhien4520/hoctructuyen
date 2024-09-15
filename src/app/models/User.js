const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DOCUMENT_NAME = 'User'
const COLLECTION_NAME = 'Users'

const userSchema = new Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dateOfBirth: { type: Date },
    role: {
        type: String,
        enum: ['admin', 'teacher', 'student'],
        required: true
    },
    classes: [{ type: Schema.Types.ObjectId, ref: 'Class' }]
}, {
    collection: COLLECTION_NAME,
    timestamps: true
});

const User = mongoose.model(DOCUMENT_NAME, userSchema);
module.exports = User;
