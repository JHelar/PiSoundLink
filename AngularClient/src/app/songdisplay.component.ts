import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Song } from './song';

@Component({
    selector: 'song-display',
    templateUrl: './songdisplay.component.html'
})
export class SongDisplayComponent {
    @Input() song: Song;
    @Output() remove: EventEmitter<string> = new EventEmitter();

    Remove() {
        this.remove.emit(this.song.key);
    }
}