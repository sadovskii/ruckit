import { STORAGE_BLACKLIST_CHANNELS, STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON, STORAGE_BLACKLIST_KEYWORDS, STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON } from "src/app/shared/constants";

export enum BlackListRestrictionType {
    Channels = 'channel',
    // Words and phrases (the former separate phrases list was merged into this one)
    Keywords = 'keyword'
}

export type BlackListDictionary<T> = {
  [type in BlackListRestrictionType]: T;
};

export const blackListRestrictionTypeToStoreMap: Record<BlackListRestrictionType, string> = {
  [BlackListRestrictionType.Channels]: STORAGE_BLACKLIST_CHANNELS,
  [BlackListRestrictionType.Keywords]: STORAGE_BLACKLIST_KEYWORDS,
};

export const blackListRestrictionTypeToStoreTurnOnMap: Record<BlackListRestrictionType, string> = {
  [BlackListRestrictionType.Channels]: STORAGE_BLACKLIST_CHANNELS_IS_TURNED_ON,
  [BlackListRestrictionType.Keywords]: STORAGE_BLACKLIST_KEYWORDS_IS_TURNED_ON,
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
  [BlackListRestrictionType.Keywords]: {
    title: 'blacklist_keywords_title',
    description: 'blacklist_keywords_description',
    placeholder: 'blacklist_keywords_placeholder',
    hiddenCount: 'blacklist_keywords_hidden_count',
    manageTitle: 'blacklist_keywords_manage_title',
    newRestriction: 'blacklist_keywords_new_restriction',
  },
};

export interface BlackListRestritionModel {
  id: number;
  value: string;
}