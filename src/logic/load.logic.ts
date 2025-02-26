import { textStore } from "../stores/text.store";

import { storage_key } from "../data/constants.data";

export const loadData = () => {
  const data =
    localStorage.getItem(storage_key) ??
    JSON.stringify({ content: "", height: 200 });

  const parsed: { content: string; height: number } = JSON.parse(data);

  const { content, height } = parsed;

  textStore.content = content;
  textStore.height = height;
};
