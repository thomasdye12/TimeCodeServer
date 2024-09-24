const express = require('express');
const router = express.Router();
const multer = require('multer');
const csvDataManager = require('./csvDataManager');
const fs = require('fs');
const csv = require('csv-parse');
const { promisify } = require('util');

const upload = multer({ dest: 'uploads/' }); // Files will temporarily be saved to 'uploads/'

// Route to handle the form submission
router.post('/upload-csv', upload.single('csvfile'), async (req, res) => {
    const { title, loadWithoutRorder} = req.body; // Get the title from the form
    const file = req.file; // Get the uploaded file
    // new value loadWithoutRorder that will be sent from the web page


    csvDataManager.ParseCSVupload(title, file.path,loadWithoutRorder); // Parse the CSV file
    res.send('File uploaded successfully');
});

// create a route to add a sub cue stack that is added to the main cue stack
router.post('/add-cue-stack',upload.single('csvfile'), async (req, res) => {
    const file = req.file; // Get the uploaded file

    csvDataManager.AddCueStack(file.path); // Add the sub cue stack to the main cue stack
    res.send('Sub cue stack added successfully');
});

module.exports = router;
