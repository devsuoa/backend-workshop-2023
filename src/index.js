require('dotenv').config();
const cors = require('cors');
const express = require('express');
const app = express();
const port = process.env.PORT ? process.env.PORT : 8000;
const connectDb = require('./mongoDb/db');
const notesRoutes = require('./routes/notes')

connectDb();
const corsOptions = {
    origin: '*',  //replace with your domain or '*'
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions));
app.use(express.json())

// app.get('/', (req, res) => {
//     const {word} = req.query
//     res.send('Hello World!' + word)
// })
//
// app.post('/', (req, res) => {
//     const {word} = req.body
//     console.log(req.body)
//     res.send('Hello World!' + word)
// })
app.use('/notes', notesRoutes);

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
