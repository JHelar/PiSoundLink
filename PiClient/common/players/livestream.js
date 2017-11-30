const shell         = require('shelljs');
const EventEmitter  = require('events');
const omxplayer     = require('node-omxplayer');

exports.makeLiveStream = () => {
    let player = new omxplayer();
    let isPlaying = false;
    let info = null;
    
    const eventEmitter = new EventEmitter();

    player.on('close', () => {
        isPlaying = false;
        eventEmitter.emit('stopped');
    })

    const preLoad = song => new Promise((res, reject) => {
        const { args } = song;
        if(song.info) res(song);
        else {
            res(Object.assign(
                song,
                {
                    info: { duration: -1, title: args.url }
                }
            ));
        }
    })

    return {
        preLoad,
        play: urlPromise => {
            urlPromise.then(song => {
                info = song.info;
                player.newSource(song.args.url, 'local', false, 8);
                isPlaying = true;
            })
            .catch(err => {
                console.log(err)
                isPlaying = false;
                eventEmitter.emit('stopped');
            })
        },
        stop: () => {
            player.pause();
            isPlaying = false;
        },
        onStopped: callback => eventEmitter.on('stopped', callback),
        info: () => info
    }
}