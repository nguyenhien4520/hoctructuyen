const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DOCUMENT_NAME = 'Class'
const COLLECTION_NAME = 'Classes'

const classSchema = new Schema({
    name: { type: String, required: true },
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    students: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    tests: [{ type: Schema.Types.ObjectId, ref: 'Test' }] 
},{
    collection: COLLECTION_NAME,
    timestamps: true
});

module.exports = mongoose.model(DOCUMENT_NAME, classSchema);
