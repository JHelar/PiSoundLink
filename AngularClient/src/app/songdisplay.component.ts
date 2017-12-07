import { Component, Input } from '@angular/core';
import { Song } from './song';

@Component({
    selector: 'song-display',
    templateUrl: './songdisplay.component.html'
})
export class SongDisplayComponent {
    @Input() song: Song;
}