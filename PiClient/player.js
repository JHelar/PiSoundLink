const shell = require('shelljs');
const util = require('../Common/utils');
const EventEmitter = require('events');
const urlMatch = require('../Common/urlmatch').makeUrlMatch();
const omxplayer = require('node-omxplayer');

exports.makePlayer = (playlist) => {
    let currentPlayer = null;
    let players = [];
    let currentSong = null;

    const prepSong = args => {
        let { key , value } = args;
        console.log('Prep song: ', args);
        let player = util.find(players, p => p.name === value.player);
        if(player){
            player.makeArgs(value.args).then(data => {
                let newArgs = util.extend(value.args, { info: data });
                playlist.updateSong({ 
                    key: key, 
                    value: { 
                        player: value.player, 
                        played: value.played,
                        args: newArgs 
                    } 
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
        if(currentSong) song = util.next(playlist.list, s => (s.key === currentSong.key));
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
    
    const preLoad = args => new Promise((res, reject) => {
        const { url } = args;
        if(args.info){
            res(args.info);
        }
        else if(url){
            let ytUrl = urlMatch(url); 
            if(ytUrl){
                shell.exec(`youtube-dl -s --print-json ${url}`, { silent:true, async: true }, (code, stdout, stderr) => {
                    res(makeInfo(JSON.parse(stdout)))
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
        makeArgs: args => preLoad(args),
        play: urlPromise => {
            urlPromise
            .then(data => {
                info = data;
                player.newSource(data.songUrl, 'local', false, 8);
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