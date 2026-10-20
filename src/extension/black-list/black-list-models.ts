export interface BlackListData {
    blackListChannels: string[];
    // words and phrases
    blackListWords: string[];
}

export interface BlackListChannel {
    n: string; // name
    ni: string; // nicknames
}