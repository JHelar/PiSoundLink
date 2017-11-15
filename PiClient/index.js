const firebase = require('firebase');
const config = require('./config').firebaseConfig;
const firebaseapp = firebase.initializeApp(config);

const express = require('express');
const app = express();

const players = require('./player');
const playlist = require('../Common/database').playlist;
const util = require('../Common/utils');

const youtube = players.makeYoutube();
const player = players.makePlayer(playlist);
player.register('Youtube', youtube); 
player.init();

// app.get('/play/:player', (req, res) => {
//     res.send(player.play(req.params.player, req.query))
// });

// app.get('/next', (req, res) => {
//     res.send(player.next());
// })

// app.get('/stop', (req, res) => {
//     res.send(player.stop());
// })

// app.get('/info', (req, res) => {
//     res.send(player.info());
// })

app.listen(3000, () => console.log('Example app listening on port 3000!'));