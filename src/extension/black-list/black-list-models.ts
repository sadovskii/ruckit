export interface BlackListData {
    blackListChannels: string[];
    blackListWords: string[];
    blackListPhrases: string[];
}

export interface BlackListChannel {
    n: string; // name
    ni: string; // nicknames
}