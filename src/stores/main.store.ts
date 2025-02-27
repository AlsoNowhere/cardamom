import { MintEvent, refresh, Store } from "mint";

import { wait } from "sage";

import { loadData } from "../logic/load.logic";

import { Line } from "../models/Line.model";

import { keysHeld } from "../data/keys-held.data";

class MainStore extends Store {
  lines: Array<Line>;
  currentIndex: number;
  listElementRef: HTMLUListElement;

  doNothing: MintEvent<HTMLFormElement>;

  constructor() {
    super({
      lines: [],
      currentIndex: null,
      listElementRef: null,

      oninit: async () => {
        document.addEventListener("keydown", ({ key }) => {
          if (key === "Control") {
            keysHeld.Control = true;
          }
        });

        document.addEventListener("keyup", ({ key }) => {
          if (key === "Control") {
            keysHeld.Control = false;
          }
        });

        await wait();

        loadData();
        refresh(mainStore);
      },

      doNothing(event) {
        event.preventDefault();
      },
    });
  }
}

export const mainStore = new MainStore();
