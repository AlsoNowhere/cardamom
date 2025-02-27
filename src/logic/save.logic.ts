import { mainStore } from "../stores/main.store";

import { lineId, storage_key } from "../data/constants.data";

export const saveData = () => {
  const { lines } = mainStore;

  const data = JSON.stringify({
    lines,
    lineIndex: lineId.index,
  });

  localStorage.setItem(storage_key, data);
};
