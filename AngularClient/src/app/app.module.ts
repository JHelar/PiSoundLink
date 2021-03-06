import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule, fromRef } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';

import { firebaseConfig } from './firebase_config';

import { AppComponent } from './app.component';
import { PlaylistComponent } from './playlist.component';
import { YoutubeComponent } from './youtube.component';
import { SongDisplayComponent } from './songdisplay.component';

@NgModule({
  declarations: [
    AppComponent,
    PlaylistComponent,
    YoutubeComponent,
    SongDisplayComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule
  ],
  providers: [],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
