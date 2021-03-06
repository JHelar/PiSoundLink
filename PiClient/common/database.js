const Rx = require('rx');
const util = require('./utils');

exports.makePlaylist = fb => {
    const playlistQuery = fb.database().ref('/playlist');
    let isInitialized = false;
    let playlistSource = [];

    const createAndAddSong = (key, val) => {
        let song = util.find(playlistSource, s => s.key === key);
        if(!song){
            let newSong = {
                key: key,
                value: val
            };
            playlistSource.push(newSong);
            playlistSource.sort((a, b) => a.order > b.order);
            return newSong;
        }
        return null;
    }

    
    const onPlaylistReady = Rx.Observable.create(observer => {
        playlistQuery.on('value', snap => {
            const value = snap.val();
            for(let v in value){
                createAndAddSong(v, value[v]);
            }
            isInitialized = true;
            observer.onCompleted()
        });
        return () => {
            playlistQuery.off('value');
        }
    })
    playlistQuery.on('child_removed', (snap) => {
        console.log('Playlist remove song: ', snap);
        console.log('Playlist current list: ', playlistSource);
        const removed = util.remove(playlistSource, song => song.key === snap.key);  
        console.log('Playlist current list: ', playlistSource);
    })
    
    const onSongAdded = Rx.Observable.create(observer => {
        let listener = playlistQuery.on('child_added', (snap, prevName) => {
            if(isInitialized){
                const value = snap.val();
                let song = createAndAddSong(snap.key, snap.val());
                if(song) observer.onNext(song);
            }
        }, error => observer.onError(error));
        return () => {
            playlistQuery.off('child_added', listener);
        }
    });

    const updateSong = (args) => {
        const { key, value } = args;
        return playlistQuery.child(key).set(value);
    }

    return {
        list: playlistSource,
        onPlaylistReady,
        onSongAdded,
        updateSong
    }
}
