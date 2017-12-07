const util          = require('./utils');

exports.makePlayer = playlist => {
    let currentPlayer = null;
    let players = [];
    let currentSong = null;

    const prepSong = args => {
        let { key , value } = args;
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
            console.log('Player: Playing: ', currentSong);
            let { key, value } = currentSong;
            let player = util.find(players, p => p.name === value.player);
            
            currentSong.value.played = true;
            playlist.updateSong(currentSong);
            if(player){
                currentPlayer = player;
                return currentPlayer.play(currentPlayer.preLoad(value));  
            }
        }
    }

    const nextSong = () => {
        let song = null;
        console.log('Player: Next song.');
        if(currentSong) song = util.find(playlist.list, s => s.value.order === (currentSong.value.order + 1))
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