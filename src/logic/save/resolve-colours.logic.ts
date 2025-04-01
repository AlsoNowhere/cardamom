import { listStore } from "../../stores/list.store";

export const resolveSaveColours = (coloursLine: string) => {
  const hasFileColoursIndex = listStore.contentFromFile.findIndex((x) =>
    x.includes("\\colortbl")
  );

  // ** File HAS colours AND colours ARE defined in app.
  if (hasFileColoursIndex !== -1 && coloursLine !== undefined) {
    listStore.contentFromFile.splice(hasFileColoursIndex, 1, coloursLine);
  }
  // ** File DOES NOT HAVE colours AND colours ARE defined in app.
  else if (hasFileColoursIndex === -1 && coloursLine !== undefined) {
    listStore.contentFromFile.splice(1, 0, coloursLine);
  }
  // ** File HAS colours AND colours ARE NOT defined in app.
  else if (hasFileColoursIndex !== -1 && coloursLine === undefined) {
    listStore.contentFromFile.splice(hasFileColoursIndex, 1);
  }
};
