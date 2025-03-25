import { Store } from "mint";

class TogglesStore extends Store {
  constructor() {
    super({});
  }
}

export const togglesStore = new TogglesStore();
