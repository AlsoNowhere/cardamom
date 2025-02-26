import { textStore } from "../stores/text.store";

import { storage_key } from "../data/constants.data";

export const saveData = () => {
  const { content, height } = textStore;

  const data = JSON.stringify({
    content,
    height,
  });

  localStorage.setItem(storage_key, data);
};
