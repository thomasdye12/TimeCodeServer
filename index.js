const express = require('express');
const http = require('http');
const csvDataManager = require('./routers/csvDataManager');
const app = express();
const server = http.createServer(app);
const fs = require('fs');

// Static files
app.use(express.static('public'));

// Routers
const apiRoutes = require('./routers/ApiRouter');
const uploadRoutes = require('./routers/Uploader');
app.use(apiRoutes);
app.use(uploadRoutes);

// WebSocket Router
const { sendData } = require('./routers/websocketRouter')(server);

// MIDI Router
const { session, mtc } = require('./routers/midiRouter')();


let lastTime = '';
let stopTimer;
const stopDelay = 1000; // 1 second without change to consider the timecode stopped
const logFilePath = 'timecode_stops.log'; // Path to the log file
var CSVDataPlaying = [];
let lastSentCsvData = {};  // Variable to store the last CSV data sent






mtc.on('change', () => {
  const smtpeString = mtc.getSMTPEString();
  // console.log('MTC change:', smtpeString);
  const [currentHours, currentMinutes] = smtpeString.split(':');
  const currentTimeInMinutes =  csvDataManager.timecodeToMinutes(smtpeString);

  if (smtpeString !== lastTime) {
    clearTimeout(stopTimer);
    stopTimer = setTimeout(() => {
      lastSentCsvData = {};
      const logEntry = {
        timecode: smtpeString,
        timestamp: new Date().toISOString(),
        unixTimestamp: Date.now(),
        CSV: CSVDataPlaying
      };
      fs.appendFile(logFilePath, JSON.stringify(logEntry) + "\n", err => {
        if (err) console.error('Error writing to log file:', err);
      });
      sendData("timecode_stop", logEntry);
      
    }, stopDelay);
  }

  const csvData = csvDataManager.getCsvData();
  // Iterate through sorted csvData to find the right range
  for (let i = 0; i < csvData.length; i++) {

    if (currentTimeInMinutes >= csvData[i].startTime && currentTimeInMinutes < csvData[i].endTime) {
      CSVDataPlaying = csvData[i];
      if (lastSentCsvData !== CSVDataPlaying) {

        sendData("csv_data", CSVDataPlaying);
        lastSentCsvData = CSVDataPlaying;
      }

      break; // Exit loop once the correct interval is found
    }
  }

  lastTime = smtpeString;

  sendData("timecode", { time: smtpeString, CSV: CSVDataPlaying });
});



// session.connect({ address: '127.0.0.1', port: 5004 });
// Load CSV data on server start
csvDataManager.FirstLoad();

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


// function to reload the CSV data

