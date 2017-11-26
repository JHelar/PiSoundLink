const firebase      = require('firebase');
const config        = require('/common/config').firebaseConfig;
const firebaseapp   = firebase.initializeApp(config);

const express       = require('express');
const app           = express();

const players       = require('./player');
const playlist      = require('/common/database').playlist;
const util          = require('/common/utils');

const youtube       = players.makeYoutube();
const player        = players.makePlayer(playlist);

player.register('Youtube', youtube); 
player.init();

app.listen(3000, () => console.log('Example app listening on port 3000!'));