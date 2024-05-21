# TimeCodeServer

TimeCodeServer is a dynamic application that displays MIDI timecode information in a web browser using WebSockets. The server captures timecode sent over MIDI, processes this data, and streams it to connected clients in real-time. This enables users to monitor timecode data seamlessly through a web interface.
## Features 
- **Real-time MIDI Timecode Display** : View MIDI timecode data live as it is being broadcasted. 
- **Web-based Interface** : Access timecode data from any device that supports modern web browsers. 
- **File Upload Capability** : Users can upload CSV files directly through the web interface for further processing. 
- **Event Logging** : Timecode stop events are logged and can be viewed in a dedicated events page.
## Installation

To get TimeCodeServer up and running on your local machine, follow these steps:
### Prerequisites 
- Node.js (Download and install from [Node.js official website]() )
- npm (Comes installed with Node.js)
### Clone the Repository

First, clone the repository to your local machine using Git:

```bash
git clone https://github.com/thomasdye12/TimeCodeServer.git
cd TimeCodeServer
```


### Install Dependencies

Inside the project directory, install the required dependencies:

```bash
npm install
```


### Start the Server

Run the server with:

```bash
node index.js
```
then connect to the server using your network midi at IP:5006



This will start the server on `http://localhost:3000`. Navigate to this URL in your web browser to view the application.
## Web Endpoints

The server hosts several web pages: 
- **index.html** : The main landing page where real-time MIDI timecode data is displayed. 
- **events.html** : A log of timecode stop events. This page updates in real-time as new stop events occur. 
- **upload.html** : A utility page that allows users to upload CSV files which are then processed by the server.
## Contributing

Contributions to TimeCodeServer are welcome! Please fork the repository and submit pull requests with your proposed changes.
## License

TimeCodeServer is open-source software licensed under the MIT license.---

<!-- i want to add some images -->

