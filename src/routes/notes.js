const express = require('express');
const router = express.Router();
const Notes = require('../models/Notes');

router.post('/', async (req, res) => {
    try {
        const {title, category, message} = req.body;

        console.log(req.body)

        // Validate required fields
        if (!title || !category || !message) {
            return res.status(400).json({msg: "Please enter all fields"});
        }

        const note = new Notes({title: title, category: category, message: message});
        await note.save();

        res.json(note);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/', async (req, res) => {
    try {
        const notes = await Notes.find({});
        res.json(notes);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.delete('/', async (req, res) => {
    try {

        const notes = await Notes.findByIdAndDelete(req.query.id);
        res.json(notes);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;