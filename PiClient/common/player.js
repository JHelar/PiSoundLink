const shell         = require('shelljs');
const EventEmitter  = require('events');
const omxplayer     = require('node-omxplayer');

const urlMatch      = require('./matchers').makeUrlMatch();
const util          = require('./utils');

exports.makePlayer = (playlist) => {
    let currentPlayer = null;
    let players = [];
    let currentSong = null;

    const prepSong = args => {
        let { key , value } = args;
        console.log('Prep song: ', args);
        let player = util.find(players, p => p.name === value.player);
        if(player){
            player.preLoad(value).then(song => {
                playlist.updateSong({ 
                    key: key, 
                    value: song
                }).then(val => {
                    if(!currentSong) nextSong();
                });
            });
        }
    }

    const play = () => {
        if(currentSong) {
            let { key, value } = currentSong;
            let player = util.find(players, p => p.name === value.player);
            
            currentSong.value.played = true;
            playlist.updateSong(currentSong);
            if(player){
                currentPlayer = player;
                return currentPlayer.play(currentPlayer.makeArgs(value.args));  
            }
        }
    }

    const nextSong = () => {
        let song = null;
        if(currentSong) song = util.find(playlist.list, s => s.value.order === (currentSong.order + 1))
        else song = util.find(playlist.list, s => !s.value.played);
        currentSong = song;
        
        play();
    }

    const init = () => {
        playlist.onPlaylistReady.subscribe(() => console.log('1'), () => console.log('2'), () => {
            util.forEach(
                playlist.list, 
                song => prepSong(song)
            )
            nextSong();
        })
    
        playlist.onSongAdded.subscribe(song => prepSong(song));
    }

    return {
        register: (name, player) => {
            players.push(Object.assign({ name }, player));
            player.onStopped(() => {
                nextSong();
            })
        },
        init,
        info: () => {
            if(currentPlayer && currentPlayer.isPlaying()) return currentPlayer.info();
            return 'No song is playing currently';
        },
        stop: () => {
            if(currentPlayer){
                currentPlayer.stop();
                currentPlayer = null;
            }
        }
    }
}

exports.makeYoutube = () => {
    let player = new omxplayer();
    let isPlaying = false;
    let info = null;
    const eventEmitter = new EventEmitter();

    player.on('close', () => {
        isPlaying = false;
        eventEmitter.emit('stopped');
    });
    
    const preLoad = song => new Promise((res, reject) => {
        const { args } = song;
        if(args.songUrl && song.info){
            res(song);
        }
        else if(args.url){
            let ytUrl = urlMatch(args.url); 
            if(ytUrl){
                shell.exec(`youtube-dl -s --print-json ${args.url}`, { silent:true, async: true }, (code, stdout, stderr) => {
                    let info = makeInfo(JSON.parse(stdout));

                    res(Object.assign(
                        song, 
                        { 
                            info: { duration: info.duration, title: info.title },
                            args: { url: args.url, songUrl: info.songUrl }
                        }));
                });
            }else{
                reject('No proper url')
            }
        }
        else{
            reject('No url')
        }
    });

    const makeInfo = data => ({
        title: data.title,
        artist: data.creator,
        duration: data.duration,
        songUrl: data.formats[0].url 
    })

    return {
        preLoad,
        play: urlPromise => {
            urlPromise
            .then(song => {
                info = song.info;
                player.newSource(song.args.songUrl, 'local', false, 8);
                isPlaying = true;
            })
            .catch(err => console.log(err));
            return 'Playing song.';
        },
        stop: () => {
            player.pause();
            isPlaying = false;
        },
        onStopped: callBack => eventEmitter.on('stopped', callBack),
        info: () => {
            return info;
        }
    }
}