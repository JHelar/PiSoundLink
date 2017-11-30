const firebase      = require('firebase');
const config        = require('./common/config').firebaseConfig;
const firebaseapp   = firebase.initializeApp(config);

const express       = require('express');
const app           = express();

const playlist      = require('./common/database').playlist;
const util          = require('./common/utils');

const player        = require('./common/player').makePlayer(playlist);
const youtube       = require('./common/players/youtube').makeYoutube();
const livestream    = require('./common/players/livestream').makeLiveStream();

player.register('Youtube', youtube); 
player.register('Livestream', livestream);
player.init();

app.listen(3000, () => console.log('Example app listening on port 3000!'));