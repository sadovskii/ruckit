import { STORAGE_BLACKLIST_CHANNELS, STORAGE_BLACKLIST_KEYWORDS, STORAGE_BLACKLIST_PHRASES } from "src/app/shared/constants";

export enum BlackListRestrictionType {
    Channels = 'channel',
    Keywords = 'keyword',
    Phrases = 'phrase'
}

export type BlackListDictionary<T> = {
  [type in BlackListRestrictionType]: T;
};

const blackListRestrictionTypeToStoreMap: Record<BlackListRestrictionType, string> = {
  [BlackListRestrictionType.Channels]: STORAGE_BLACKLIST_CHANNELS,
  [BlackListRestrictionType.Keywords]: STORAGE_BLACKLIST_KEYWORDS,
  [BlackListRestrictionType.Phrases]: STORAGE_BLACKLIST_PHRASES,
};


export enum BlackListRestriction2Type {
    Channels = STORAGE_BLACKLIST_CHANNELS,
    Keywords = STORAGE_BLACKLIST_KEYWORDS,
    Phrases = STORAGE_BLACKLIST_PHRASES
}

export type BlackListDictionary2<T> = {
  [type in BlackListRestriction2Type]: T;
};

export const MAX_LENGTH_RESTRICTION = 30;

export interface BlackListRestritionModel {
  id: number;
  value: string;
}