const express = require('express');
const fetchuser = require('../middleware/fetchuser');
const router = express.Router();
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');

// Route 1: create a route to  fetch all notes of the user: GET "/api/notes/fetchallnotes" login required.

router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const user = await Notes.find({ user: req.user.id })
        res.json(user)

    } catch (error) {
        console.error(error.massage);
        res.status(500).send("Internal Server Error");
    }
})
// Route 2 : create route to add notes to the user: POST "/api/notes/addnotes" login required.

router.post('/addnotes', fetchuser, [
    body('title', 'Enter valid title').isLength({ min: 3 }),
    body('description', 'description must be atleast 5 characters').isLength({ min: 5 }),], async (req, res) => {
        try {
            const { title, description, tag } = req.body;

            const error = validationResult(req);
            if (!error.isEmpty()) {
                res.status(400).json({ error: error.array() });
            }

            const note = new Notes({
                title, description, tag, user: req.user.id
            })
            const savedNotes = await note.save();
            res.json(savedNotes)

        } catch (error) {
            console.error(error.massage);
            res.status(500).send("Internal Server Error");
        }

    })

// Route 3 : Update the existing notes to the user: PUT "/api/notes/updatenotes" login required.
router.put('/updatenotes/:id', fetchuser, async (req, res) => {

    const { title, description, tag } = req.body;
    try {

        // create a new body
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        // find the note to be updated  and update it

        let note = await Notes.findById(req.params.id);

        if (!note) { return res.status(404).send("Not Found") };

        if (note.user.toString() !== req.user.id) {
            return res.status(404).send("Not Allowd");
        }

        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.json(note);
    } catch (error) {
        console.error(error.massage);
        res.status(500).send("Internal Server Error");
    }
})
// Route 4 : Delete the existing notes to the user: DELETE "/api/notes/deletenotes" login required.
router.delete('/deletenotes/:id', fetchuser, async (req, res) => {
    try {


        // find the note to be deleted  and delete it

        let note = await Notes.findById(req.params.id);

        if (!note) { return res.status(404).send("Not Found") };

        // Allow Deletion if user owns the note

        if (note.user.toString() !== req.user.id) {
            return res.status(404).send("Not Allowd");
        }

        note = await Notes.findByIdAndDelete(req.params.id);
        res.json({ "Success": "note has been deleted", note });
    } catch (error) {
        console.error(error.massage);
        res.status(500).send("Internal Server Error");
    }
})


module.exports = router;