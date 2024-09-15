const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DOCUMENT_NAME = 'Test'
const COLLECTION_NAME = 'Tests'

const testSchema = new Schema({
    title: { type: String, required: true },
    type: { type: String, required: true},
    grade: { type: String, required: true},
    subject: { type: String, required: true},
    numberQuestion: {type: Number, required: true},
    classes: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
    questions: [{
      text: { type: String, required: true },
      options: [{
        text: { type: String, required: true },
        isCorrect: { type: Boolean, required: true }
      }]
    }]
  },{
    collection: COLLECTION_NAME,
    timestamps: true
  });

  module.exports = mongoose.model(DOCUMENT_NAME, testSchema);

