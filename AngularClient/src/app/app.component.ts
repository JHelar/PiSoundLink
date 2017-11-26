import { Component } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { Song, YoutubeSong } from './song';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  playlistRef: AngularFireList<Song>;
  playlist: Observable<Song[]>;
  songOrder: number;

  youtubeModel: YoutubeSong = {
    key: '',
    player: 'Youtube',
    args: {
      songUrl: '',
      url: ''      
    },
    info: null,
    order: -1,
    played: false
  };

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

  AddYoutube() {
      this.youtubeModel.order = this.songOrder ? this.songOrder + 1 : 1;
      
      this.playlistRef.push(this.youtubeModel).then(song => {
        this.youtubeModel.key = song.key;
        this.playlistRef.update(this.youtubeModel.key, this.youtubeModel);
        this.youtubeModel.args.url = '';
      });
  }
}
