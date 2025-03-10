import { keysHeld } from "../data/keys-held.data";

export const addKeyEvents = () => {
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
};
