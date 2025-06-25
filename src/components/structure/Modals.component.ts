import { component, MintScope, node } from "mint";

import { ManageQuickLoad } from "../modals/ManageQuickLoad.component";

import { modalsStore } from "../../stores/modals.store";

class ModalsComponent extends MintScope {
  constructor() {
    super();

    modalsStore.connect(this);
  }
}

export const Modals = component("<>", ModalsComponent, {}, [
  node(ManageQuickLoad, {
    "[quickLoadModalState]": "quickLoadModalState",
    "[closeQuickLoadModal]": "closeQuickLoadModal"
  })
]);
