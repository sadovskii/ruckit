import { PopupNavbarItemType } from "./popup-navbar-item/popup-navbar-item-type"

export const POPUP_NAVBAR_ITEMS = {
    blackList: {
        key: PopupNavbarItemType.BlackList,
        active: true,
        disabled: false,
        lieanerIcon: 'black-list-linear-32',
        solidIcon: 'black-list-solid-32'
    },
    hideList: {
        key: PopupNavbarItemType.HideList,
        active: false,
        disabled: false,
        lieanerIcon: 'hide-list-linear-32',
        solidIcon: 'hide-list-solid-32'
    },
    settings: {
        key: PopupNavbarItemType.Settings,
        active: false,
        disabled: false,
        lieanerIcon: 'settings-linear-32',
        solidIcon: 'settings-solid-32'
    }
}

export interface PopupNavbar {
    type: PopupNavbarItemType;
    active: boolean;
    disabled: boolean;
    lieanerIcon: string;
    solidIcon: string;
}