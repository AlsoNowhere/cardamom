import { mainStore } from "../stores/main.store";

import { lineId, storage_key } from "../data/constants.data";
import { variables } from "../data/variables.data";

export const saveData = () => {
  const { lines } = mainStore;
  const { fontSize } = variables;

  const data = JSON.stringify({
    lines,
    lineIndex: lineId.index,
    fontSize,
  });

  localStorage.setItem(storage_key, data);
};
