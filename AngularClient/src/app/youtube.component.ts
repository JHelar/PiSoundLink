import { Component, EventEmitter, Output } from '@angular/core';
import { YoutubeArgs } from './song';

@Component({
    selector: 'youtube',
    templateUrl: './youtube.component.html'
})
export class YoutubeComponent {
    @Output() onAdd: EventEmitter<YoutubeArgs> = new EventEmitter(); 
    placeholder: string = 'Enter a Youtube url...';

    youtubeRegex: any = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b\/watch([-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    youtubeUrl: string = '';

    Add(){
        const args: YoutubeArgs = {
            url: this.youtubeUrl,
            songUrl: null
        };
        this.onAdd.emit(args);
    }
}