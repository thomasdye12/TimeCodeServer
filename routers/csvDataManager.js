// csvDataManager.js
const csv = require('csv-parse');
const fs = require('fs');

let CSVshow = {};

// Function to set CSV data
function setCsvData(newData) {
    CSVshow.events = newData;
}

// Function to get CSV data
function getCsvData() {
    return CSVshow.events;
}
function csvPush(data) {
    CSVshow.events.push(data);
}

// Function to load CSV data
function loadCSVData(filePath) {
    fs.createReadStream(filePath)
        .pipe(csv.parse({ columns: true, trim: true }))
        .on('data', (row) => {
            CSVshow.events.push(row);
        })
        .on('end', () => {
            console.log('CSV file successfully processed');
            CSVshow.events.sort((a, b) => timecodeToMinutes(a.TimeCode) - timecodeToMinutes(b.TimeCode));
            // loop over the csv data and add the start and end time to the object
            CSVshow.events.forEach((item, index) => {
                item.name = `${item.class} - ${item.Choreographer} - ${item.Type}`;
                item.startTime = timecodeToMinutes(item.TimeCode);
                item.endTime = (index + 1 < csvData.length) ? timecodeToMinutes(csvData[index + 1].TimeCode) : Number.MAX_SAFE_INTEGER;
            });
        });

}
function loadJSONData(filePath) {
    // load the contents of the json file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.log('Error reading file from disk:', err);
            return;
        }
        try {
            const jsonData = JSON.parse(data);
            CSVshow = jsonData;
            console.log('JSON file successfully processed');
        } catch (err) {
            console.log('Error parsing JSON string:', err);
        }
    });

}
function timecodeToMinutes(timecode) {
    // h : m : s : f
    // 00:10:00:00
    // const [hours, minutes] = timecode.split(':');
    const [hours, minutes, seconds, frames] = timecode.split(':');
    // return parseInt(hours) * 60 + parseInt(minutes);
    return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds) + parseInt(frames) / 30;
}
function ParseCSVupload(title, filepath, loadWithoutRorder = false) {
    var records = [];
    fs.createReadStream(filepath)
        .pipe(csv.parse({ columns: true, trim: true }))
        .on('data', (row) => {
            // only add the row if the Rorder key is present and has a value or if the loadWithoutRorder is set to true
            if (row.Rorder || loadWithoutRorder) {
                records.push(row);
            }
        })
        .on('end', () => {
            console.log('CSV file successfully processed');
            records.sort((a, b) => timecodeToMinutes(a.TimeCode) - timecodeToMinutes(b.TimeCode));
            // loop over the csv data and add the start and end time to the object
            records.forEach((item, index) => {
                item.name = `${item.class} - ${item.Choreographer} - ${item.Type}`;
                item.startTime = timecodeToMinutes(item.TimeCode);
                item.endTime = (index + 1 < records.length) ? timecodeToMinutes(records[index + 1].TimeCode) : Number.MAX_SAFE_INTEGER;
            });
            // random string to make the file name unique
            const name = title + Math.random().toString(36).substring(7);
            fs.writeFileSync(`./data/${name}.json`, JSON.stringify({ title: title, events: records }, null, 2), 'utf8');
            updateCurrentShowFile(name);
            loadJSONData(`./data/${name}.json`);
        });



}


function FirstLoad() {
    // load the state.json file and the file name of the current json show file 
    fs.readFile('./state.json', 'utf8', (err, data) => {
        if (err) {
            console.log('Error reading file from disk:', err);
            return;
        }
        try {
            const state = JSON.parse(data);
            loadJSONData(`./data/${state.current}.json`);
        } catch (err) {
            console.log('Error parsing JSON string:', err);
        }
    });

}
// function to update the current show file
function updateCurrentShowFile(fileName) {
    // Read the existing JSON file
    fs.readFile('./state.json', 'utf8', (err, data) => {
        if (err) {
            console.log('Error reading file:', err);
            return;
        }

        // Parse the existing JSON data
        let jsonData = JSON.parse(data);

        // Update the 'current' property
        jsonData.current = fileName;

        // Write the updated JSON back to the file
        fs.writeFile('./state.json', JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
            if (err) {
                console.log('Error writing file:', err);
            } else {
                console.log('File is written successfully!');
            }
        });
    });
}

function getFullCsvData() {
    return CSVshow;

}

function getFullDataRunningorder() {
    const output = CSVshow;
    // if there is a Rorder key on each object then use that to sort the array
    if (CSVshow.events[0].Rorder) {
        output.events = CSVshow.events.sort((a, b) => a.Rorder - b.Rorder);
    }
    return output;


}

// AddCueStack takes ina csv file in the formatt "Track","Type","Position","Cue No","Label","Fade" and adds it to the main cue stack under the correct cue, then resaveds the file
function AddCueStack(filePath) {
    var records = [];
    fs.createReadStream(filePath)
        .pipe(csv.parse({ columns: true, trim: true }))
        .on('data', (row) => {
            records.push(row);
        })
        .on('end', () => {
            console.log('CSV file successfully processed');
            // use the timecode to find the correct cue to add the sub cue stack to
            records.forEach((item,index) => {
                // remove the " from the position"
                item.startTime = timecodeToMinutes(item.Position);
                item.endTime = (index + 1 < records.length) ? timecodeToMinutes(records[index + 1].Position) : Number.MAX_SAFE_INTEGER;
                const time = timecodeToMinutes(item.Position);
                const cue = CSVshow.events.find((event) => event.startTime <= time && event.endTime > time);
                if (cue) {
                    if (!cue.cues) {
                        cue.cues = [];
                    }
                    cue.cues.push(item);
                }
            });
            // random string to make the file name unique
            const name = Math.random().toString(36).substring(7);
            fs.writeFileSync(`./data/${name}.json`, JSON.stringify(CSVshow, null, 2), 'utf8');
            updateCurrentShowFile(name);
            loadJSONData(`./data/${name}.json`);
        });
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
        AddCueStack
    };
