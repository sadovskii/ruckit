export enum BlackListRestrictionType {
    Channels = 'channel',
    Keywords = 'keyword',
    Phrases = 'phrase'
}

export type Dictionary<T> = {
  [type in BlackListRestrictionType]: T;
};

export const MAX_LENGTH_RESTRICTION = 30;

export interface BlackListRestritionModel {
  id: number;
  value: string;
}