const shell         = require('shelljs');
const EventEmitter  = require('events');
const omxplayer     = require('node-omxplayer');

const urlMatch      = require('../matchers').makeUrlMatch();
const util          = require('../utils');

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
            .catch(err => {
                console.log(err)
                isPlaying = false;
                eventEmitter.emit('stopped');
            });
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