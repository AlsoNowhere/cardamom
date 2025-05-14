import { Store, MintEvent, Resolver, refresh } from "mint";

import { selectTab } from "../logic/select-tab.logic";

import { appStore } from "../stores/app.store";

import { OpenFile } from "../models/OpenFile.model";

class TabsStore extends Store {
  tabs: Resolver<Array<OpenFile>>;

  selectTab: () => void;
  removeTab: MintEvent;

  constructor() {
    super({
      tabs: new Resolver(() => appStore.openFiles),

      selectTab: function () {
        if (appStore.currentFileIndex === this._i) return;
        selectTab(this._i);
      },

      removeTab: function (event) {
        event.stopPropagation();
        const index = this.index;
        let newIndex: number;
        appStore.openFiles.splice(index, 1);

        if (appStore.currentFileIndex !== index) {
          refresh(tabsStore);
          return;
        }
        if (appStore.openFiles.length === 0) {
          newIndex = -1;
        } else {
          newIndex = index === 0 ? 0 : index - 1;
        }
        selectTab(newIndex);
      }
    });
  }
}

export const tabsStore = new TabsStore();
