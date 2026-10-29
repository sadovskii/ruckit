import { STORAGE_BLACKLIST_CHANNELS, STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON, STORAGE_BLACKLIST_KEYWORDS_AND_PHRASES, STORAGE_BLACKLIST_KEYWORDS_AND_PHRASES_IS_TURNED_ON } from "src/app/shared/constants";

export enum BlackListRestrictionType {
    Channels = 'channel',
    // the stored value stays 'keyword' (it existed before phrases were merged into this list)
    KeywordsAndPhrases = 'keyword'
}

export type BlackListDictionary<T> = {
  [type in BlackListRestrictionType]: T;
};

export const blackListRestrictionTypeToStoreMap: Record<BlackListRestrictionType, string> = {
  [BlackListRestrictionType.Channels]: STORAGE_BLACKLIST_CHANNELS,
  [BlackListRestrictionType.KeywordsAndPhrases]: STORAGE_BLACKLIST_KEYWORDS_AND_PHRASES,
};

export const blackListRestrictionTypeToStoreTurnOnMap: Record<BlackListRestrictionType, string> = {
  [BlackListRestrictionType.Channels]: STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON,
  [BlackListRestrictionType.KeywordsAndPhrases]: STORAGE_BLACKLIST_KEYWORDS_AND_PHRASES_IS_TURNED_ON,
};

export const MAX_LENGTH_RESTRICTION = 30;

/** i18n message keys per restriction type (separate keys keep grammar correct in every locale). */
export interface BlackListMessageKeys {
  title: string;
  description: string;
  placeholder: string;
  hiddenCount: string;
  manageTitle: string;
  newRestriction: string;
}

export const blackListRestrictionTypeToMessageKeys: Record<BlackListRestrictionType, BlackListMessageKeys> = {
  [BlackListRestrictionType.Channels]: {
    title: 'blacklist_channels_title',
    description: 'blacklist_channels_description',
    placeholder: 'blacklist_channels_placeholder',
    hiddenCount: 'blacklist_channels_hidden_count',
    manageTitle: 'blacklist_channels_manage_title',
    newRestriction: 'blacklist_channels_new_restriction',
  },
  [BlackListRestrictionType.KeywordsAndPhrases]: {
    title: 'blacklist_keywords_and_phrases_title',
    description: 'blacklist_keywords_and_phrases_description',
    placeholder: 'blacklist_keywords_and_phrases_placeholder',
    hiddenCount: 'blacklist_keywords_and_phrases_hidden_count',
    manageTitle: 'blacklist_keywords_and_phrases_manage_title',
    newRestriction: 'blacklist_keywords_and_phrases_new_restriction',
  },
};

export interface BlackListRestritionModel {
  id: number;
  value: string;
}