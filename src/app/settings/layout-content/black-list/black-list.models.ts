import { STORAGE_BLACKLIST_CHANNELS, STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON, STORAGE_BLACKLIST_KEYWORDS, STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON, STORAGE_BLACKLIST_PHRASES, STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON } from "src/app/shared/constants";

export enum BlackListRestrictionType {
    Channels = 'channel',
    Keywords = 'keyword',
    Phrases = 'phrase'
}

export type BlackListDictionary<T> = {
  [type in BlackListRestrictionType]: T;
};

export const blackListRestrictionTypeToStoreMap: Record<BlackListRestrictionType, string> = {
  [BlackListRestrictionType.Channels]: STORAGE_BLACKLIST_CHANNELS,
  [BlackListRestrictionType.Keywords]: STORAGE_BLACKLIST_KEYWORDS,
  [BlackListRestrictionType.Phrases]: STORAGE_BLACKLIST_PHRASES,
};

export const blackListRestrictionTypeToStoreTurnOnMap: Record<BlackListRestrictionType, string> = {
  [BlackListRestrictionType.Channels]: STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON,
  [BlackListRestrictionType.Keywords]: STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON,
  [BlackListRestrictionType.Phrases]: STORAGE_BLACKLIST_PHRASES_IS_TURNED_ON,
};

export const MAX_LENGTH_RESTRICTION = 30;

export interface BlackListRestritionModel {
  id: number;
  value: string;
}