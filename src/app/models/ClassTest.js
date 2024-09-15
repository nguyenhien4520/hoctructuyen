const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const DOCUMENT_NAME = 'ClassTest'
const COLLECTION_NAME = 'ClassTests'

const classTestSchema = new Schema({
    class: { type: Schema.Types.ObjectId, ref: 'Class' },
    test: { type: Schema.Types.ObjectId, ref: 'Test' },
    show: {type: Boolean}
},{
    collection: COLLECTION_NAME,
    timestamps: true
});

module.exports = mongoose.model(DOCUMENT_NAME, classTestSchema);