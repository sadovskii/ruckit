export enum SideBarItemsType {
    Header = 1,
    AboutExtension,
    BlackList,
    HideList,
    Password,
    Settings
}

export const SideBarItems = {
    header: {
      key: SideBarItemsType.Header,
      params: {
        active: false,
        disable: false
      }
    },
    aboutExtension: {
      key: SideBarItemsType.AboutExtension,
      params: {
        active: false,
        disable: false
      }
    },
    blackList: {
      key: SideBarItemsType.BlackList,
      params: {
        active: false,
        disable: false
      }
    },
    hideList: {
      key: SideBarItemsType.HideList,
      params: {
        active: false,
        disable: false
      }
    },
    password: {
      key: SideBarItemsType.Password,
      params: {
        active: false,
        disable: false
      }
    },
    settings: {
      key: SideBarItemsType.Settings,
      params: {
        active: false,
        disable: false
      }
    }
};