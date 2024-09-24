// apiRoutes.js
const express = require('express');
const router = express.Router();
const csvDataManager = require('./csvDataManager');
const fs = require('fs');
const readline = require('readline');

// Define the '/api/ips' endpoint
router.get('/api/ips', (req, res) => {
  const interfaces = require('os').networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if ('IPv4' === iface.family && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  res.json(addresses);
});

// Define the '/ReloadCSV' endpoint
router.get('/ReloadCSV', (req, res) => {
  csvDataManager.FirstLoad();
  res.json({ status: 'success' });
});

// Define the '/history' endpoint
router.get('/history', async (req, res) => {
  const lines = [];
  const fileStream = fs.createReadStream('timecode_stops.log');  // Adjust path as needed

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    lines.push(JSON.parse(line));
    if (lines.length > 50) {
      lines.shift(); // Keep only the last 50 entries
    }
  }

  res.json(lines);
});


router.get('/api/csvdata', (req, res) => {
    res.json(csvDataManager.getCsvData());
  });

  //  full csv data
  router.get('/api/csvdatafull', (req, res) => {
    res.json(csvDataManager.getFullDataRunningorder());
  });



  // end point to export the json data to a file
  router.get('/api/exportjson', (req, res) => {
    const data = JSON.stringify(csvDataManager.getCsvData());
    res.setHeader('Content-disposition', 'attachment; filename=csvdata.json');
    res.setHeader('Content-type', 'application/json');
    res.write(data, () => {
      res.end();
    });
  });
  // /end  to give a list of endpoints
  router.get('/end', (req, res) => {
// dynamically generate the list of endpoints,making them links that work 
    const endpoints = [];
    const routes = router.stack;
    routes.forEach(route => {
      if (route.route && route.route.path) {
        endpoints.push(`<a href="${route.route.path}">${route.route.path}</a>`);
      }
    });
    res.send(endpoints.join('<br>'));
  }
  );

module.exports = router;
