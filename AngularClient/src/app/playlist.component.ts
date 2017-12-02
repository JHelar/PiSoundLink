import { Component } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { Song } from './song';

@Component({
    selector: 'playlist',
    templateUrl: './playlist.component.html'
})
export class PlaylistComponent {
    playlistRef: AngularFireList<Song>;
    playlist: Observable<Song[]>;
    songOrder: number;
    
    constructor(
      private afDb: AngularFireDatabase
    ) {
      this.playlistRef = afDb.list('/playlist');
      this.playlist = this.playlistRef.valueChanges();
      this.playlist.subscribe(songs => {
        let song = songs.sort((a: Song, b: Song) => a.order < b.order ? -1 : a.order > b.order ? 1 : 0).slice(-1)[0];
        this.songOrder = song.order;
      })
    }

    Add(song: Song){
        song.order = this.songOrder + 1;
        this.playlistRef.push(song).then((song_item: any) => {
            song.key = song_item.key;
            this.playlistRef.update(song.key, song);
        })
    }
}