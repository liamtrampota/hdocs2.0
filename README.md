# hdocs2.0
A basic collaborative text editor built with Electron, React, and Material UI on the front end, and express, mongoDB, and socket.io on the back-end.

hdocs2.0 has a basic registration and login flow - user profiles and documents are stored in mongoDB.
![](hdocs_registration.gif)

Users can create and share files with one another, and see changes in real-time through websockets.

![](collaborative_editing.gif)

To run hdocs2.0 yourself, make sure to install electron, create an env.sh file and add your own SERVER_URI (ipv4 for running locally) and MONGO_URI process variables. Use 'npm run start' to launch the front end and 'npm run build-dev' to start the server locally.

