import { component, div, mFor, MintEvent, MintScope, node, refresh, Resolver, span, UpwardRef } from "mint";

import { Button, closeModal, Field, Modal, TField } from "thyme";

import { styles } from "sage";

import { saveLocal } from "../../logic/load-save-local.logic";

import { appStore } from "../../stores/app.store";
import { modalsStore } from "../../stores/modals.store";
import { controlsStore } from "../../stores/controls.store";

import { QuickLoad } from "../../models/QuickLoad.model";

class ManageQuickLoadComponent extends MintScope {
  quickLoadTargets: Resolver<typeof appStore.quickLoadTargets>;

  folderPathInputRef: UpwardRef<HTMLInputElement>;

  addQuickLoad: MintEvent<HTMLFormElement>;

  removeItem: () => void;

  closeQuickLoadModal: () => void;

  constructor() {
    super();

    const that = this;

    this.quickLoadTargets = new Resolver(() => appStore.quickLoadTargets);

    this.folderPathInputRef = new UpwardRef(null);

    this.addQuickLoad = function (event) {
      event.preventDefault();
      if (!(this.folderPathInputRef.ref instanceof HTMLInputElement)) return;
      const value = this.folderPathInputRef.ref?.value;
      if (!value) return;
      const newItem = new QuickLoad(value);
      appStore.quickLoadTargets.push(newItem);
      this.folderPathInputRef.ref.value = "";
      saveLocal();
      refresh(that);
    };

    this.removeItem = function () {
      appStore.quickLoadTargets.splice(this.index, 1);
      saveLocal();
      refresh(that);
    };

    this.closeQuickLoadModal = () => {
      closeModal(modalsStore, "quickLoadModalState");
      refresh(controlsStore);
    };
  }
}

export const ManageQuickLoad = component(
  "<>",
  ManageQuickLoadComponent,
  {},
  node(
    Modal,
    {
      class: "quick-load",
      style: styles({ width: "80%" }),
      "[state]": "quickLoadModalState",
      "[addQuickLoad]": "addQuickLoad",
      "[closeQuickLoadModal]": "closeQuickLoadModal",
      "[quickLoadTargets]": "quickLoadTargets",
      "[removeItem]": "removeItem",
      "[closeOnBackgroundClick]": "closeQuickLoadModal",
      "[folderPathInputRef]": "folderPathInputRef",
    },
    [
      node(
        "ul",
        { class: "quick-load__list" },
        node("li", { ...mFor("quickLoadTargets"), mKey: "_i", class: "quick-load__list-item" }, [
          span("{folderPath}"),
          node(Button, { icon: "trash-o", "[onClick]": "removeItem", "[index]": "_i" }),
        ]),
      ),

      node("form", { class: "flex no-margin", "(submit)": "addQuickLoad" }, [
        node<TField>(Field, {
          name: "folder-path",
          label: "Folder path",
          labelClass: "grid-6",
          "[ref]": "folderPathInputRef",
        }),

        node(Button, {
          type: "submit",
          theme: "blueberry",
          icon: "plus",
          class: "margin-right margin-bottom",
          square: true,
          "[folderPathInputRef]": "folderPathInputRef",
        }),
      ]),

      node(Button, { label: "Close", "[onClick]": "closeQuickLoadModal" }),
    ],
  ),
);
