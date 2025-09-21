export interface BlackListData {
    blackListChannels: string[];
    blackListWords: string[];
    blackListPhrases: string[];
}

export interface BlackListChannel {
    name: string;
    nickname: string;
}