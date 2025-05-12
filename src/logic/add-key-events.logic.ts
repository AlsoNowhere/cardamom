import { refresh } from "mint";

import { appStore } from "../stores/app.store";

import { keysHeld } from "../data/keys-held.data";

export const addKeyEvents = () => {
  document.addEventListener("keydown", ({ key }) => {
    if (key === "Control") {
      keysHeld.Control = true;
    }

    if (key === "f" && keysHeld.Control) {
      appStore.isSearchOpen = true;
      refresh(appStore);
    }
  });

  document.addEventListener("keyup", ({ key }) => {
    if (key === "Control") {
      keysHeld.Control = false;
    }
  });
};
