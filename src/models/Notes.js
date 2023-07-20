const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema({
    title: String,
    category: String,
    message: String
});

module.exports = mongoose.model('Notes', notesSchema);