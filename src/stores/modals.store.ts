import { Store } from "mint";

import { closeModal, TModalState } from "thyme";

class ModalsStore extends Store {
  quickLoadModalState: TModalState;

  constructor() {
    super({
      quickLoadModalState: "closed"
    });
  }
}

export const modalsStore = new ModalsStore();
