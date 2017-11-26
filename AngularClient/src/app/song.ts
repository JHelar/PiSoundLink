interface SongInfo {
    duration: number,
    title: string
}

export interface Song {
    key: string,
    played: boolean,
    order: number,
    player: string,
    info: SongInfo,
    args: any
}

interface YoutubeArgs {
    url: string,
    songUrl: string
}

export interface YoutubeSong extends Song {
    args: YoutubeArgs
}





