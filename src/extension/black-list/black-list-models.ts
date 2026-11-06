export interface BlackListData {
    blackListChannels: string[];
    blackListKeywordsAndPhrases: string[];
}

export interface BlackListChannel {
    n: string; // name
    ni: string; // nicknames
}