
## Installing Node.js

Download Node.js from https://nodejs.org/en/download/current and follow the steps for installation.

## Setting up MongoDB
Sign up MongoDB instance using https://account.mongodb.com/account/login.

Once signed into your account, create a mongoDb project and a database instance. Set up a username and password for the database.


## Setting up backend project
Create the npm environment
```
npm init -y
```

Install packages
```
npm install express, mongoose, cors
```

Create project folder structure
```
backend-workshop-2023/
├── package.json (automaticaly generated)
├── package-lock.json (automaticaly generated)
├── src/
    ├── index.js
    ├── mongoDb/
    │   └── db.js
    ├── models/
    │   └── Notes.js
    ├── routes/
    │   └── notes.js

```

Create express app insde src/index.js:
```
const cors = require('cors');
const express = require('express');
const app = express();
const port = 8000;
const connectDb = require('./mongoDb/db');
const notesRoutes = require('./routes/notes')

connectDb();
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions));
app.use(express.json())
app.use('/notes', notesRoutes);

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
```

Create database connection inside mongoDb/db.js:
```
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(`mongodb+srv://<username>:$<password>@backend-workshop-2023.0wlks5v.mongodb.net/?retryWrites=true&w=majority`);
        console.log('MongoDB connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

module.exports = connectDB;
```
Create db schema inside models/Notes.js:
```
const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema({
    title: String,
    category: String,
    message: String
});

module.exports = mongoose.model('Notes', notesSchema);
```

Create RESTful endpoints inside routes/notes.js:
```
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
```

Run backend with:
```
node src/index.js
```


## Making changes to frontend

Add nodeID to ViewNotes component:
```
export default function ViewNotes({allNotes, setAllNotes}) {
    
    return (
        <div className="view-notes">
            <div className="notes-grid">
                {allNotes.map((note) => {
                    return (
                        <Note noteId={note['_id']} noteTitle={note.title} noteCategory={note.category} noteMessage={note.message} allNotes={allNotes} setAllNotes={setAllNotes} />
                )})}
            </div>
        </div>
    )
}
```

Add server call to createNode() in New component:
```
import React from "react";
import "./NewNote.css";

export default function New({allNotes, setAllNotes}) {

    function createNote() {

        // Retrieve user text from DOM and save it into variables
        const noteTitle = document.getElementById("newTitle").value;
        const noteCategory = document.getElementById("newCategory").value;
        const noteText = document.getElementById("newText").value;

        // Creating an object out of the variables
        const note = {
            title: noteTitle,
            category: noteCategory,
            message: noteText
        }

        // CLearing the inputs on the page
        document.getElementById("newTitle").value = "";
        document.getElementById("newCategory").value = "";
        document.getElementById("newText").value = "";

        fetch('http://localhost:8000/notes', {
            method: 'POST', // specify the request method
            headers: {
                'Content-Type': 'application/json' // specify that we're sending JSON
            },
            body: JSON.stringify(note)
        })
            .then(response => response.json()) // parse the JSON response
            .then(data => {
                // Adding the new note object to the array containing all notes
                setAllNotes([...allNotes, data]);
            }) // do something with the data
            .catch(error => console.error('Error:', error)); // catch any errors


    }

    return (
        <div className="new-note">
            <input id="newTitle" type="text" placeholder="Enter task title"/>
            <input id="newCategory" type="text" placeholder="Enter a category"/>
            <textarea id="newText" placeholder="Enter descriptions"></textarea>
            <button id="addButton" onClick={createNote} type="submit">Add</button>
        </div>
    )
}
```

Add server call to App.js:
```
import React, {useEffect, useState} from 'react';
import './App.css';
import MainPage from './Components/MainPage/MainPage';

function App() {

  // Initialise useState hook for storing and updating new notes
  const [allNotes, setAllNotes] = useState([]);

  useEffect(() => {
      fetch("http://localhost:8000/notes")
          .then(res => res.json())
          .then(data => setAllNotes(data))
          .catch(err => {
              console.error(err)
          })
  }, [])

  return (
    <div className="App">
      <MainPage allNotes={allNotes} setAllNotes={setAllNotes} />
    </div>
  );
}

export default App;
```

Add server call to Note component:
```
import React from "react";
import "./Note.css";

export default function Note({noteId, noteTitle, noteCategory, noteMessage, allNotes, setAllNotes}) {

    function deleteNote() {
        console.log(noteId)
        console.log(allNotes)
        fetch("http://localhost:8000/notes?id="+noteId, {method:"DELETE"})
            .then(res => {
                if(res.ok) {
                    // Create new array to store all notes except deleted note
                    const newAllNotes = [];

                    // Add all notes to array except the deleted note
                    allNotes.map(note => {
                        if (note.title !== noteTitle && note.category !== noteCategory) {
                            newAllNotes.push(note);
                        }
                    })

                    // Update state variable that stores all notes to contain new array of notes
                    setAllNotes(newAllNotes);
                }
            })
            .catch(err => {
                console.error(err);
            })
    }

    return (
        <div className="note">
            <p id="note-category">{noteCategory}</p>
            <p id="note-title">{noteTitle}</p>
            <p id="note-message">{noteMessage}</p>
            <button id="del-button" onClick={deleteNote}>Delete</button>
        </div>
    )
}
```

You app should be working at this stage.





