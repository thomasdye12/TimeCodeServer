const csv = require('csv-parse');
const fs = require('fs');

let CSVshow = {};
let SendDataFunction = null;

// Utility function to process CSV rows and add start/end times
function processCsvRows(records) {
    records.sort((a, b) => timecodeToMinutes(a.TimeCode) - timecodeToMinutes(b.TimeCode));
    records.forEach((item, index) => {
        item.name = `${item.class} - ${item.Choreographer} - ${item.Type}`;
        item.startTime = timecodeToMinutes(item.TimeCode);
        item.endTime = (index + 1 < records.length) ? timecodeToMinutes(records[index + 1].TimeCode) : Number.MAX_SAFE_INTEGER;
    });
}

// Function to read CSV file and process its content
function readCsvFile(filePath, callback) {
    const records = [];
    fs.createReadStream(filePath)
        .pipe(csv.parse({ columns: true, trim: true }))
        .on('data', (row) => records.push(row))
        .on('end', () => {
            console.log('CSV file successfully processed');
            callback(records);
        });
}

// Function to set CSV data
function setCsvData(newData) {
    CSVshow.events = newData;
}

// Function to get CSV data
function getCsvData() {
    return CSVshow.events;
}

// Function to push new data into CSV data
function csvPush(data) {
    CSVshow.events.push(data);
}

// Function to load CSV data and process it
function loadCSVData(filePath) {
    readCsvFile(filePath, (records) => {
        CSVshow.events = records;
        processCsvRows(CSVshow.events);
    });
}

// Function to load JSON data
function loadJSONData(filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return console.error('Error reading file from disk:', err);
        try {
            const jsonData = JSON.parse(data);
            CSVshow = jsonData;
            console.log('JSON file successfully processed');
            SendDataFunction && SendDataFunction("updateList", getFullDataRunningorder());
        } catch (err) {
            console.error('Error parsing JSON string:', err);
        }
    });
}

// Function to convert timecode to minutes
function timecodeToMinutes(timecode) {
    const [hours, minutes, seconds, frames] = timecode.split(':');
    return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds) + parseInt(frames) / 30;
}

// General function to handle CSV uploads
function ParseCSVupload(title, filepath, loadWithoutRorder = false) {
    readCsvFile(filepath, (records) => {
        if (!loadWithoutRorder) {
            records = records.filter(row => row.Rorder);
        }
        processCsvRows(records);
        const name = title + Math.random().toString(36).substring(7);
        fs.writeFileSync(`./data/${name}.json`, JSON.stringify({ title, events: records }, null, 2), 'utf8');
        updateCurrentShowFile(name);
        loadJSONData(`./data/${name}.json`);
    });
}

// Function to load initial state
function FirstLoad() {
    fs.readFile('./state.json', 'utf8', (err, data) => {
        if (err) return console.error('Error reading file from disk:', err);
        try {
            const state = JSON.parse(data);
            loadJSONData(`./data/${state.current}.json`);
        } catch (err) {
            console.error('Error parsing JSON string:', err);
        }
    });
}

// Function to update current show file in the state
function updateCurrentShowFile(fileName) {
    fs.readFile('./state.json', 'utf8', (err, data) => {
        if (err) return console.error('Error reading file:', err);
        const jsonData = JSON.parse(data);
        jsonData.current = fileName;
        fs.writeFile('./state.json', JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
            if (err) console.error('Error writing file:', err);
        });
    });
}

// Function to get full CSV data
function getFullCsvData() {
    return CSVshow;
}

// Function to get sorted data based on Rorder
function getFullDataRunningorder() {
    const output = { ...CSVshow };
    if (CSVshow.events[0]?.Rorder) {
        output.events = [...CSVshow.events].sort((a, b) => a.Rorder - b.Rorder);
    }
    return output;
}

// Function to add a cue stack to the main cue based on timecodes
function AddCueStack(filePath) {
    readCsvFile(filePath, (records) => {
        records.forEach((item, index) => {
            item.startTime = timecodeToMinutes(item.Position);
            item.endTime = (index + 1 < records.length) ? timecodeToMinutes(records[index + 1].Position) : Number.MAX_SAFE_INTEGER;
            const time = item.startTime;
            const cue = CSVshow.events.find(event => event.startTime <= time && event.endTime > time);
            if (cue) {
                cue.cues = cue.cues || [];
                cue.cues.push(item);
            }
        });
        const name = Math.random().toString(36).substring(7);
        fs.writeFileSync(`./data/${name}.json`, JSON.stringify(CSVshow, null, 2), 'utf8');
        updateCurrentShowFile(name);
        loadJSONData(`./data/${name}.json`);
        SendDataFunction && SendDataFunction("updateList", getFullDataRunningorder());
    });
}

// Function to update an event based on timecode
function updateEventByTimeCode(timeCode, updatedEvent) {
    if (!updatedEvent) return console.error('Error: updatedEvent is undefined or null');
    const eventIndex = CSVshow.events.findIndex(event => event.TimeCode === timeCode);
    if (eventIndex !== -1) {
        if (updatedEvent.neworderLocation !== undefined) {
            const newOrderIndex = updatedEvent.neworderLocation;
            const [eventToMove] = CSVshow.events.splice(eventIndex, 1);
            CSVshow.events.splice(newOrderIndex, 0, eventToMove);
        } else {
            CSVshow.events[eventIndex] = updatedEvent;
        }
        return true;
    }
    console.error(`Event with TimeCode ${timeCode} not found.`);
    return false;
}

// Function to create events by JSON input
function CreateEventsbyJSON(eventsdata) {
    eventsdata.events.forEach((item, index) => {
        item.Rorder = index + 1;

    });
    processCsvRows(eventsdata.events);
    const name = eventsdata.title + Math.random().toString(36).substring(7);
    fs.writeFileSync(`./data/${name}.json`, JSON.stringify({ title: eventsdata.title, events: eventsdata.events }, null, 2), 'utf8');
    updateCurrentShowFile(name);
    loadJSONData(`./data/${name}.json`);
    return true;
}

// Utility to move array elements
function array_move(arr, old_index, new_index) {
    if (new_index >= arr.length) {
        arr.push(...Array(new_index - arr.length + 1));
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr;
}

// Exporting the functions
module.exports = {
    setCsvData,
    getCsvData,
    csvPush,
    loadCSVData,
    timecodeToMinutes,
    ParseCSVupload,
    FirstLoad,
    getFullCsvData,
    getFullDataRunningorder,
    AddCueStack,
    updateEventByTimeCode,
    CreateEventsbyJSON,
    array_move,
    set SendDataFunction(fn) {
        if (typeof fn === 'function') {
            SendDataFunction = fn;
            console.log('SendDataFunction has been set to a function.');
        } else {
            console.error('Tried to assign SendDataFunction, but it was not a function.');
        }
    },
    get SendDataFunction() {
        return SendDataFunction;
    }
};
