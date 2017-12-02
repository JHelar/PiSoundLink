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

export interface YoutubeArgs {
    url: string,
    songUrl: string
}