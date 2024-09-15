const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DOCUMENT_NAME = 'Result'
const COLLECTION_NAME = 'Results'

const resultSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  test: { type: Schema.Types.ObjectId, ref: 'Test', required: true }, 
  class: { type: Schema.Types.ObjectId, ref: 'Class', required: true }, 
  score: { type: Number, required: true }, 
  resultAnswers: [{
    questionIndex: { type: Number, required: true }, 
    userSelectedOption: { type: Number, required: true },
    correctAnswer: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true} 
  }]
},{
  collection: COLLECTION_NAME,
  timestamps: true
});

module.exports = mongoose.model('Result', resultSchema);
