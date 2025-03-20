// import { component, mFor, MintScope, mRef, node } from "mint";

// import { ListItem } from "../ListItem.component";
// import { Controls } from "../tool-bars/Controls.component";
// import { Options } from "../tool-bars/Options.component";

// import { listStore } from "../../stores/list.store";

// class MainComponent extends MintScope {
//   constructor() {
//     super();

//     listStore.connect(this);
//   }
// }

// export const Main = component(
//   "main",
//   MainComponent,
//   { class: "padding-large" },
//   [
//     node(Controls),
//     node(Options),

//     node(
//       "form",
//       { class: "card snow-bg", "(submit)": "doNothing" },
//       node(
//         "ul",
//         { class: "list", ...mRef("listElementRef") },
//         node("li", { ...mFor("lines"), mKey: "id", class: "list-item" }, [
//           node(ListItem, {
//             "[content]": "content",
//             "[style]": "getStyles",
//             "[index]": "_i",
//           }),
//         ])
//       )
//     ),

//     node("div", { id: "the-real-content" }),
//   ]
// );
