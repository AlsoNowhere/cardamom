(function () {
  'use strict';

  class CreateNode {
      constructor(mintNode, props = null, content = null) {
          this.mintNode = mintNode;
          this.props = props;
          this.content = content;
      }
  }

  const MINT_ERROR = "MINT ERROR --";
  const MINT_WARN = "MINT WARN --";
  const global = {
      mintElement_index: 0,
  };
  const attributesThatAreBoolean = ["checked"];
  const attributesThatAreProperties = [
      "checked",
      "value",
      "textContent",
      "innerHTML",
  ];
  const forScopePermantProperties = [
      "_x",
      "_i",
      "mintElement_index",
      "_mintBlueprint",
  ];

  const handleAppErrors = (rootElement, baseRootScope, initialContent) => {
      // ** CATCH the user passing in non HTMLElement for rootElement.
      if (!(rootElement instanceof HTMLElement))
          throw "app -- rootElement -- You must pass a HTMLElement for the rootElement.";
      // ** CATCH the user passing in null for rootScope.
      if (baseRootScope === null)
          throw "app -- rootScope -- Cannot pass null as root scope. Root scope is defined against generic T as can't autofill from null.";
      // ** CATCH the user not passing in Object for rootScope.
      if (typeof baseRootScope !== "object")
          throw "app -- rootScope -- Value not Object.";
      // ** CATCH the user not passing either a string, MintElement or Array.
      if (typeof initialContent !== "string" &&
          !(initialContent instanceof Array) &&
          !(initialContent instanceof CreateNode)) {
          throw "app -- content -- Must be string or Array.";
      }
      // ** CATCH the user passing "_children" keyword incorrectly.
      if ((initialContent instanceof Array && initialContent.includes("_children")) ||
          initialContent === "_children") {
          throw new Error(`${MINT_ERROR} Can only pass "_children" as child of Component.`);
      }
  };

  class MintAttribute {
      constructor(cloneAttribute) {
          this.cloneAttribute = cloneAttribute;
      }
  }

  // ** Props are defined at the Mint Node level but when we create Mint Elements we
  // ** need to make sure these are unique so here we clone the props.
  const cloneProps = ({ props }) => {
      const newProps = {};
      if (!props) {
          return newProps;
      }
      for (let [key, value] of Object.entries(props)) {
          if (value instanceof MintAttribute) {
              // ** In specific examples, such as when cloning a MintNode for use in mFor, we need to make sure
              // ** each MintAttribute is unique.
              newProps[key] = value.cloneAttribute(value);
          }
          else {
              newProps[key] = value;
          }
      }
      return newProps;
  };

  // ** IMPORTANT
  // ** The order in which mint attributes are processed it important.
  // ** For example: mIf, if false, should stop all other blueprinting.
  const mintAttributeOrder = ["mExtend", "mIf", "mFor", "mRef"];
  const mintAttributesList = ["mExtend", "mIf", "mFor", "mRef"];
  const attributesToIgnore = [
      "mintElement_index",
      ...mintAttributeOrder,
      "mKey",
  ];

  const conflicts = [
      ["mIf", "mFor"],
      ["mFor", "mRef"],
  ];
  const resolveConflicts = (keys) => {
      for (let [a, b] of conflicts) {
          if (keys.includes(a) && keys.includes(b)) {
              throw new Error(`${MINT_ERROR} attributes -- Cannot have ${a} and ${b} on the same element.`);
          }
      }
  };
  // ** Certain Properties (Component props) and Attributes on Components and Elements need to be
  // ** run in a particular order. We create that order here as an Array of strings (Object keys).
  const resolvePropsOrder = (props) => {
      const keys = Object.keys(props);
      // ** Certain attributes cannot be both on an element, resolve that here.
      resolveConflicts(keys);
      keys.sort(([a], [b]) => {
          return mintAttributeOrder.indexOf(a) - mintAttributeOrder.indexOf(b);
      });
      return keys;
  };

  // ** Here we fix a duplication of logic that is for the users' benefit.
  const fixProps = (props) => {
      if (props === null)
          return;
      for (let key of Object.keys(props)) {
          if (mintAttributesList.includes(key)) {
              if (props[key][key]) {
                  props[key] = props[key][key];
              }
          }
      }
  };

  const generateBlueprint = ({ node, parentBlueprint, scope, _rootScope, isSVG, useGivenScope, }) => {
      var _a;
      fixProps(node.props);
      const props = cloneProps({ props: (_a = node.props) !== null && _a !== void 0 ? _a : {} });
      /* Dev */
      // _DevLogger_("GENERATE", "Blueprint", mintContent);
      // ** ORDER IS IMPORTANT!
      // ** Here we take the attributes and order them in a specific run order.
      // ** This way they don't conflict with each other.
      const orderedProps = resolvePropsOrder(props);
      // ** Here we get the generate function for this particular mint element.
      const { generate } = node.mintNode;
      // ** If this is MintText or MintElement then the "generate" function will be on this MintNode.
      const blueprint = generate({
          node,
          orderedProps,
          props,
          scope,
          parentBlueprint,
          _rootScope,
          isSVG,
          useGivenScope,
      });
      return blueprint;
  };
  const generateBlueprints = ({ nodes, scope, parentBlueprint, _rootScope, isSVG = false, useGivenScope = false, }) => {
      // <@ REMOVE FOR PRODUCTION
      if (nodes.find((x) => !(x instanceof CreateNode))) {
          throw new Error(`${MINT_ERROR} generateBlueprints -- nodes sent not correctly implemented.`);
      }
      // @>
      // ** Use parent scope if available. If it isn't, then use the rootScope.
      // ** This means that the blueprint must be at the app level.
      const blueprints = [];
      for (let node of nodes) {
          blueprints.push(generateBlueprint({
              node,
              scope,
              parentBlueprint,
              _rootScope,
              isSVG,
              useGivenScope,
          }));
      }
      return blueprints;
  };

  class Blueprint {
      constructor({ mintNode = null, render = null, refresh = null, scope, parentBlueprint, _rootScope, }) {
          this.mintNode = mintNode;
          this.render = render;
          this.refresh = refresh;
          this.scope = scope;
          this.parentBlueprint = parentBlueprint;
          this._rootScope = _rootScope;
          this.mintElement_index = ++global.mintElement_index;
      }
  }

  class TextBlueprint extends Blueprint {
      constructor({ mintNode, element, textValue, scope, parentBlueprint, _rootScope, }) {
          super({
              mintNode,
              scope,
              parentBlueprint,
              _rootScope,
          });
          this.element = element;
          this.textValue = textValue;
          this._dev = "Text";
      }
  }

  const generateTextBlueprint = ({ node, scope, parentBlueprint, _rootScope, }) => {
      // ** This Function can only be accessed by a MintText so tell TS that here.
      const mintText = node.mintNode;
      // ** Create the TextNode in JS.
      const textNode = document.createTextNode("");
      const { textValue } = mintText;
      return new TextBlueprint({
          mintNode: mintText,
          element: textNode,
          textValue,
          scope,
          parentBlueprint,
          _rootScope,
      });
  };

  // ** This function allows the definition of property look ups on the scope.
  // ** E.g 1
  // ** { "[class]": "data.class"}
  // ** scope = { data: { class: "padding" } }
  // ** E.g 2
  // ** const str = "Content: {data.content}"
  // ** scope = { data: { content: "text value" } }
  const resolvePropertyLookup = (target, scope) => {
      var _a;
      if (target === "_children") {
          return (_a = scope._mintBlueprint.contentFor_children) === null || _a === void 0 ? void 0 : _a.length;
      }
      let _value = scope;
      const lookups = target.split(".");
      for (let x of lookups) {
          // <@ REMOVE FOR PRODUCTION
          if (!(_value instanceof Object)) {
              console.warn(`${MINT_WARN} while attempting to parse value "{${target}}" a non object was found -> ${_value}.`);
              return "";
          }
          // @>
          _value = _value[x];
      }
      return _value;
  };

  /*
    This function takes a string and an Object (scope). Every time the string
    contains braces with a variable inside we extract the value from the scope
    and replace it in the string.
    E.g:
    cosnt str = "Here is {content}";
    const scope = { content: "the truth" };

    str becomes "Here is the truth".
  */
  //<@ REMOVE FOR PRODUCTION
  const deBracerError = (text, scope, errorMessage) => {
      console.error(errorMessage, " -- deBracer ERROR. Text sent: ", text, "Scope: ", scope);
      throw new Error(`${MINT_ERROR} Text sent to resolve, not text: ${text}`);
  };
  //@>
  const resolve = (_value, scope, errorMessage) => {
      const value = _value instanceof Function ? _value.apply(scope) : _value;
      // ** Get a resolved string only value.
      const resolvedValue = (() => {
          if (value === undefined || value === null)
              return "";
          if (typeof value === "number")
              return value.toString();
          return value;
      })();
      // ** Here we allow the Dev to define a string output that might contain {variable} itself.
      // ** Cycle through until all are resolved.
      return deBracer(resolvedValue, scope, errorMessage);
  };
  const deBracer = (text, scope, errorMessage) => {
      /* Dev */
      // _DevLogger_("Debracer", errorMessage, text, scope);
      //<@ REMOVE FOR PRODUCTION
      if (typeof text !== "string" && typeof text !== "number")
          deBracerError(text, scope, errorMessage);
      //@>
      const textValue = typeof text === "string" ? text : text.toString();
      return textValue.replace(/\\*\{[.a-zA-Z0-9_$]+\}/g, (x) => {
          // ** If value is matched as "\{variable}" then return "{variable}".
          if (x.charAt(0) === "\\")
              return x.substring(1);
          // ** Get the variable, i.e "{variable}" -> "variable".
          const subStr = x.substring(1, x.length - 1);
          if (x.includes(".")) {
              const _value = resolvePropertyLookup(subStr, scope);
              return resolve(_value, scope, errorMessage);
          }
          // ** Get the value.
          const _value = scope[subStr];
          return resolve(_value, scope, errorMessage);
      });
  };

  const refreshTextNode = (blueprint) => {
      const { element, textValue } = blueprint;
      /* Dev */
      // _DevLogger_("REFRESH", "TEXTNODE", textNode);
      element.nodeValue = deBracer(textValue, blueprint.scope, "Refresh - textNode");
      return { condition: false };
  };

  const getWhereToInsert = (parentElement, childBlueprints, blueprintIndex) => {
      for (let [i, blueprint] of childBlueprints.entries()) {
          if (i < blueprintIndex + 1)
              continue;
          const collection = blueprint.collection || blueprint.forListBlueprints;
          if (collection instanceof Array) {
              for (let contentBlueprint of collection) {
                  const element = contentBlueprint.element;
                  if (parentElement.contains(element !== null && element !== void 0 ? element : null)) {
                      return element;
                  }
              }
          }
          if (blueprint.element === undefined) {
              continue;
          }
          const element = blueprint.element;
          if (parentElement.contains(element)) {
              return element;
          }
      }
  };
  // ** This function takes a HTMLElement and add its into the parent HTMLElement.
  const addElement = (element, parentElement, blueprintsList, blueprintIndex) => {
      /* DEV */
      // _DevLogger_("ADD", "ELEMENT", element, blueprintsList);
      const elementToInsertBefore = getWhereToInsert(parentElement, blueprintsList, blueprintIndex);
      if (elementToInsertBefore !== undefined) {
          parentElement.insertBefore(element, elementToInsertBefore);
      }
      else {
          parentElement.appendChild(element);
      }
  };

  const renderTextBlueprint = (blueprint, parentElement, childBlueprints, blueprintIndex) => {
      /* Dev */
      // _DevLogger_("RENDER", "TEXTNODE", blueprint);
      const { element, textValue, scope } = blueprint;
      if (element instanceof Text) {
          element.nodeValue = deBracer(textValue, scope, "Render - textNode");
          addElement(element, parentElement, childBlueprints, blueprintIndex);
      }
  };

  class MintNode {
      constructor(content, generate, render, refresh) {
          this.content =
              content instanceof Array ? content : content === null ? [] : [content];
          this.generate = generate;
          this.render = render;
          this.refresh = refresh;
      }
  }

  class MintText extends MintNode {
      constructor(textValue) {
          super(null, generateTextBlueprint, renderTextBlueprint, refreshTextNode);
          this.textValue = textValue;
      }
  }

  // ** This function takes an Array of raw content that the user can more easily define
  // ** and returns Mint consumable Nodes.
  const createMintText = (initialContent) => {
      const content = [];
      const targetContent = [];
      if (initialContent === null)
          return content;
      if (!(initialContent instanceof Array)) {
          targetContent.push(initialContent);
      }
      else {
          targetContent.push(...initialContent);
      }
      for (let x of targetContent) {
          // ** We only accept MintNodes and so here we check if the user has passed in string values.
          // ** Then we replace them with MintTextNodes.
          if (typeof x === "string") {
              content.push(new CreateNode(new MintText(x)));
          }
          else {
              content.push(x);
          }
      }
      return content;
  };

  const hasUpdatingBlueprint = (blueprintToCheck, blueprints) => {
      if (blueprints.includes(blueprintToCheck)) {
          return true;
      }
      let beingUpdated = false;
      for (let item of blueprints) {
          if (!!item.childBlueprints) {
              beingUpdated = hasUpdatingBlueprint(blueprintToCheck, item.childBlueprints);
          }
          if (beingUpdated === true)
              break;
      }
      return beingUpdated;
  };
  class Tracker extends Array {
      constructor() {
          super();
          this.addBlueprint = function (blueprint) {
              this.push(blueprint);
          };
          this.removeBlueprint = function (blueprint) {
              const index = this.indexOf(blueprint);
              this.splice(index, 1);
          };
          this.updating = function (blueprint) {
              return hasUpdatingBlueprint(blueprint, this);
          };
      }
  }

  const currentlyTracking = new Tracker();

  const resolveMAttributesOnRender = (blueprint, parentElement, parentChildBlueprints, blueprintIndex) => {
      const { orderedProps = [], props = {} } = blueprint;
      let shouldExit = { condition: false, value: undefined };
      for (let key of orderedProps) {
          const property = props[key];
          const resolver = property.onRender;
          if (shouldExit.condition === false &&
              property instanceof MintAttribute &&
              resolver instanceof Function) {
              shouldExit = resolver.apply(property, [
                  blueprint,
                  parentElement,
                  parentChildBlueprints,
                  blueprintIndex,
              ]);
          }
      }
      return shouldExit;
  };

  const renderBlueprint = (blueprint, parentElement, parentChildBlueprints, blueprintIndex) => {
      /* DEV */
      // _DevLogger_("RENDER", "Blueprint", blueprint);
      {
          const shouldReturn = resolveMAttributesOnRender(blueprint, parentElement, parentChildBlueprints, blueprintIndex);
          if (shouldReturn.condition) {
              return;
          }
      }
      if (blueprint.mintNode === null) {
          const { collection } = blueprint;
          if (collection) {
              const indexes = [];
              let i = blueprintIndex;
              while (i - blueprintIndex < collection.length) {
                  indexes.push(i);
                  i++;
              }
              renderBlueprints(collection, parentElement, parentChildBlueprints, indexes);
          }
          return;
      }
      blueprint.mintNode.render(blueprint, parentElement, parentChildBlueprints, blueprintIndex);
  };
  const renderBlueprints = (blueprints, parentElement, parentChildBlueprints = blueprints, indexes) => {
      for (let [index, blueprint] of blueprints.entries()) {
          renderBlueprint(blueprint, parentElement, parentChildBlueprints, !!indexes ? indexes[index] : index);
      }
  };

  // ** Root of the application.
  // ** There can be more than one application in a project.
  const app = (rootElement, baseRootScope, initialContent, { componentResolvers } = { componentResolvers: [] }) => {
      var _a, _b;
      // <@ REMOVE FOR PRODUCTION
      handleAppErrors(rootElement, baseRootScope, initialContent);
      // @>
      const rootScope = Object.assign(Object.assign({}, baseRootScope), { _isRootScope: true, _rootElement: rootElement, _rootChildBlueprints: [], componentResolvers });
      // ** LIFECYCLE CALL
      // ** This one runs before the blueprints are made, but after the data is defined.
      (_a = rootScope.onpreblueprint) === null || _a === void 0 ? void 0 : _a.call(rootScope, { scope: rootScope });
      // ** Create the app content that will be added to the root element.
      const content = createMintText(initialContent);
      // ** Generate the blueprints.
      const blueprints = generateBlueprints({
          nodes: content,
          scope: rootScope,
          parentBlueprint: null,
          _rootScope: rootScope,
          isSVG: false,
      });
      /* Dev */
      // _DevLogger_("APP", "BLUEPRINTS", blueprints);
      // ** Save a reference to the blueprints that are at the root element (App) level to the rootScope.
      rootScope._rootChildBlueprints = blueprints;
      // ** LIFECYCLE CALL
      // ** This is called only once.
      (_b = rootScope.oninit) === null || _b === void 0 ? void 0 : _b.call(rootScope, { scope: rootScope });
      // ** Render the blueprints with a tracker.
      // ** We detect if one of the renders tries to trigger a refresh, which is not allowed.
      // {
      for (let [index, blueprint] of blueprints.entries()) {
          // <@ REMOVE FOR PRODUCTION
          // ** If render or refresh is called on a blueprint that is currently rendering or refreshing then its an error.
          if (currentlyTracking.updating(blueprint))
              throw new Error(`${MINT_ERROR} Render was run on blueprint that was already rendering.`);
          currentlyTracking.addBlueprint(blueprint);
          // @>
          renderBlueprints([blueprint], rootElement, blueprints, [index]);
          // <@ REMOVE FOR PRODUCTION
          currentlyTracking.removeBlueprint(blueprint);
          // @>
      }
      // ** Here we define and return a function that can remove a created app.
      return { rootElement, scope: blueprints, rootScope };
  };

  const cloneContent = (mintContent) => {
      return mintContent;
  };

  // ** This function returns the getter part of a property lookup, if it has one.
  const resolverGetter = (key, parentScope) => {
      const properties = Object.getOwnPropertyDescriptor(parentScope, key);
      let output = undefined;
      if (properties === undefined)
          return output;
      // ** We can reason here that there must be a getter if it's no writable
      // ** as Mint doesn't create one with the other.
      if (properties.writable === undefined) {
          output = properties.get;
      }
      return output;
  };

  class ScopeTransformer {
      constructor(transform) {
          this.transform = transform;
      }
  }

  // ** Some props on a Component are not what should be accessed when doing a lookup
  // ** on that item.
  // ** For example content that is derived at lookup time from something else.
  // ** We replace those here with the other content.
  const applyScopeTransformers = (scope) => {
      const keys = Object.keys(scope);
      for (let key of keys) {
          // ** We need to check if this value has already been applied.
          // ** We can do this by checking if the value is writable and has a getter.
          const getter = resolverGetter(key, scope);
          // ** We don't want to lookup the item at this time and so we ignore these.
          if (getter === undefined && scope[key] instanceof ScopeTransformer) {
              scope[key].transform(scope, key);
          }
      }
  };

  // ** This function gets the content that should be used to replace "_children".
  // ** It works by having the content saved when the Component is used in an element().
  // ** This is then replaced with cloned content from the Component definition.
  // ** This saved content can then be used to replace "_children" where it it defined.
  const getContent = (blueprint) => {
      const { parentBlueprint, contentFor_children } = blueprint;
      // ** If the content is valid then return this.
      if (contentFor_children !== undefined)
          return contentFor_children;
      // ** If the parent does not have valid content then pass undefined, which will be ignored to prevent errors.
      if (parentBlueprint === null)
          return;
      // ** We cycle back through until we get valid content.
      return getContent(parentBlueprint);
  };
  const resolveChildBlueprints = (blueprint, childBlueprints, isSVG) => {
      const { scope, _rootScope } = blueprint;
      // ** Here we get the content that should be used to replace "_children".
      // ** This is pre Blueprint generated rated.
      const childrenContent = getContent(blueprint);
      if (childrenContent !== undefined) {
          // ** If this is the keyword "_children" then replace this with childrenContent.
          // ** As these are blueprints then they will need to be cloned and unique at the render phase.
          for (let [i, item] of childBlueprints.entries()) {
              if (item instanceof TextBlueprint && item.textValue === "_children") {
                  // ** This is IMPORTANT.
                  // ** We need to remove "_children" before generating Blueprints otherwise we'll get into
                  // ** an infinite loop.
                  childBlueprints.splice(i, 1);
                  // ** Now we can generate the Blueprints.
                  const _children = generateBlueprints({
                      nodes: childrenContent,
                      scope,
                      parentBlueprint: blueprint,
                      _rootScope,
                      isSVG,
                  });
                  // ** Now we insert the Blueprints, replacing "_children".
                  childBlueprints.splice(i, 0, ..._children);
              }
          }
      }
      return childBlueprints;
  };

  // ** This function returns if a string matches the provided start and end characters.
  // ** E.g 1
  // ** str = "[class]"
  // ** matches isAttrType(str, "[", "]")
  // ** E.g 2
  // ** str = "(click)"
  // ** matches isAttrType(str, "(", ")")
  const isAttrType = (attr, start, end) => {
      return attr.charAt(0) === start && attr.charAt(attr.length - 1) === end;
  };

  const handleResolverProperties = (scope, key, value, parentScope) => {
      const getter = resolverGetter(value, parentScope);
      if (getter instanceof Function) {
          // ** If getter is undefined it means that this property is a getter, therefore created by the Resolver Object.
          // ** With that in mind we want to preserve this getter instead of just using the current value.
          Object.defineProperty(scope, key, {
              get: getter,
              configurable: true,
          });
      }
      else {
          const newValue = resolvePropertyLookup(value, parentScope);
          // ** Here we check what the new value is going to be.
          // ** If its undefined or null it means we don't want to change the default or previously
          // ** defined value.
          if (newValue === undefined || newValue === null)
              return;
          scope[key] = newValue;
      }
  };
  const bindingTemplateProp = (scope, key, value, parentScope) => {
      if (key !== "scope") {
          handleResolverProperties(scope, key, value, parentScope);
          return;
      }
  };
  // ** When a Component is defined, props are provided to it.
  // ** Here we take those props and assign their values from the parent scope to this Component.
  const assignProps = (scope, orderedProps, props, parentScope) => {
      for (let key of orderedProps) {
          const value = props[key];
          if (isAttrType(key, "[", "]")) {
              const _key = key.substring(1, key.length - 1);
              bindingTemplateProp(scope, _key, value, parentScope);
          }
          else {
              const descriptors = Object.getOwnPropertyDescriptor(scope, key);
              // ** We do not want to try to assign to a property that only has a getter. Check for that here.
              if (descriptors !== undefined &&
                  descriptors.get !== undefined &&
                  descriptors.set === undefined) {
                  return;
              }
              // ** If the prop is a string then extract the values (deBrace) from it before assigning.
              if (typeof value === "string") {
                  scope[key] = deBracer(value, parentScope, "Template -- props");
              }
              else {
                  scope[key] = value;
              }
          }
      }
  };

  const checkForErrorsOnBlueprint = (blueprint) => {
      // <@ REMOVE FOR PRODUCTION
      if (blueprint.element === undefined) {
          if (blueprint.collection === undefined) {
              throw new Error(`${MINT_ERROR} Element Blueprint was defined without element or collection.`);
          }
      }
      if (blueprint.element !== undefined) {
          if (blueprint.collection !== undefined) {
              throw new Error(`${MINT_ERROR} Element Blueprint was defined with both element and collection.`);
          }
      }
      if (blueprint.collection !== undefined) {
          if (blueprint.childBlueprints !== undefined) {
              throw new Error(`${MINT_ERROR} Element Blueprint was defined with both collection and childBlueprints.`);
          }
      }
      // @>
  };

  const resolveMAttributesOnGenerate = ({ node, htmlElement, orderedProps, props, parentScope, scope, _children, parentBlueprint, _rootScope, isSVG, isComponent, isAttribute, }) => {
      let shouldExit = { condition: false, value: undefined };
      for (let key of orderedProps) {
          const property = props[key];
          const resolver = property.onGenerate;
          if (shouldExit.condition === false &&
              property instanceof MintAttribute &&
              resolver instanceof Function) {
              shouldExit = resolver.apply(property, [
                  {
                      node,
                      htmlElement,
                      orderedProps,
                      props,
                      parentScope,
                      scope,
                      _children,
                      parentBlueprint,
                      _rootScope,
                      isSVG,
                      isComponent,
                      isAttribute,
                  },
              ]);
          }
      }
      return shouldExit;
  };

  class MintScope {
      constructor() { }
  }

  class ComponentBlueprint extends Blueprint {
      constructor({ mintNode, fragment, element, orderedProps, props, orderedAttributes, attributes, scope, parentBlueprint, collection, childBlueprints, _rootScope, contentFor_children, }) {
          super({
              mintNode,
              scope,
              parentBlueprint,
              _rootScope,
          });
          if (!!fragment)
              this.fragment = fragment;
          if (!!element)
              this.element = element;
          this.orderedProps = orderedProps;
          this.props = props;
          this.orderedAttributes = orderedAttributes;
          this.attributes = attributes;
          if (!!collection)
              this.collection = collection;
          if (!!childBlueprints)
              this.childBlueprints = childBlueprints;
          if (!!contentFor_children)
              this.contentFor_children = contentFor_children;
          if (element instanceof SVGElement)
              this.isSVG = true;
          this._dev = "Component";
      }
  }

  const generateComponentBlueprint = ({ node, orderedProps, props, scope: parentScope, parentBlueprint, _rootScope, isSVG, useGivenScope, }) => {
      var _a, _b;
      // const { mintNode, content: _children } = node;
      const { mintNode, content: _children } = node;
      fixProps(mintNode.attributes);
      const mintComponent = mintNode;
      const { element, content } = mintComponent;
      const attributes = cloneProps({
          props: mintComponent.attributes,
      });
      const orderedAttributes = resolvePropsOrder(attributes);
      // <@ REMOVE FOR PRODUCTION
      if (!(mintComponent.scope instanceof Function) &&
          mintComponent.scope !== null) {
          throw new Error(`${MINT_ERROR} Mint Component -- scope -- must pass a constructor function for Component scope argument (second argument) i.e component("div", function(){}`);
      }
      // @>
      element === "svg" && (isSVG = true);
      // <@ REMOVE FOR PRODUCTION
      if (element !== "<>" && ((element === null || element === void 0 ? void 0 : element.includes("<")) || (element === null || element === void 0 ? void 0 : element.includes(">")))) {
          throw new Error(`${MINT_ERROR} Element sent to node() contains angle brackets "${element}". Use "${element.substring(1, element.length - 1)}" instead.`);
      }
      // @>
      // ** Generate new HTMLElement.
      // ** If this is a Fragment then a new Element won't be defined.
      let newHTMLElement = undefined;
      if (element !== undefined && element !== "<>") {
          newHTMLElement =
              element === "svg" || isSVG
                  ? document.createElementNS("http://www.w3.org/2000/svg", element)
                  : document.createElement(element);
      }
      // ** Create the new Component's scope.
      let componentScope;
      if (useGivenScope) {
          // ** When mFor is looped over a Component an extra layer of scope is added.
          // ** In order to get the original Component we must do it manually here.
          componentScope = parentScope;
      }
      else {
          componentScope = new ((_a = mintComponent.scope) !== null && _a !== void 0 ? _a : MintScope)();
          // ** Certain props are ScopeTransformer objects and apply their values differently
          // ** to the Component.
          // ** We handle that here.
          applyScopeTransformers(componentScope);
      }
      // ** Here we check for app level Component Resolvers.
      // ** These are things that are run against the Component.
      // ** For example generating prop types checks.
      if (!!_rootScope.componentResolvers) {
          for (let componentResolver of _rootScope.componentResolvers) {
              componentResolver(orderedProps !== null && orderedProps !== void 0 ? orderedProps : [], props !== null && props !== void 0 ? props : {}, mintComponent, parentScope);
          }
      }
      if (!useGivenScope) {
          // ** When a Component is defined, props are provided to it.
          // ** Here we take those props and assign their values from the parent scope to this Component.
          assignProps(componentScope, orderedProps !== null && orderedProps !== void 0 ? orderedProps : [], props !== null && props !== void 0 ? props : {}, parentScope);
      }
      const commonValues = {
          node,
          htmlElement: newHTMLElement,
          parentScope,
          scope: componentScope,
          _children,
          parentBlueprint,
          _rootScope,
          isSVG,
          isComponent: true,
      };
      {
          // ** Here we resolve the props of the Component.
          // ** If one of the mAttributes on the list means we stop generating here then detect that.
          const shouldReturn = resolveMAttributesOnGenerate(Object.assign({ orderedProps: orderedProps !== null && orderedProps !== void 0 ? orderedProps : [], props: props !== null && props !== void 0 ? props : {}, isAttribute: false }, commonValues));
          if (shouldReturn.condition) {
              return shouldReturn.value;
          }
      }
      {
          // ** Here we resolve the attributes of the Component.
          // ** If one of the mAttributes on the list means we stop generating here then detect that.
          const shouldReturn = resolveMAttributesOnGenerate(Object.assign({ orderedProps: orderedAttributes, props: attributes, isAttribute: true }, commonValues));
          if (shouldReturn.condition) {
              return shouldReturn.value;
          }
      }
      // ** LIFECYCLE CALL
      (_b = componentScope.onpreblueprint) === null || _b === void 0 ? void 0 : _b.call(componentScope);
      // ** We define the content that might be used to populate the "_children" keyword inside
      // ** the Component.
      const blueprint = new ComponentBlueprint({
          mintNode: mintComponent,
          fragment: element === "<>" || undefined,
          element: newHTMLElement,
          orderedProps: orderedProps !== null && orderedProps !== void 0 ? orderedProps : [],
          props: props !== null && props !== void 0 ? props : {},
          orderedAttributes,
          attributes,
          scope: componentScope,
          parentBlueprint,
          _rootScope,
      });
      if (!!_children) {
          blueprint.contentFor_children = [];
          for (let x of _children) {
              blueprint.contentFor_children.push(cloneContent(x));
          }
      }
      componentScope._mintBlueprint = blueprint;
      /* Dev */
      // _DevLogger_("GENERATE", "COMPONENT", blueprint, parentBlueprint);
      // ** Clone the content so that each Component has unique content from the original definition.
      const _content = [];
      for (let x of content) {
          _content.push(cloneContent(x));
      }
      const _childBlueprints = generateBlueprints({
          nodes: _content,
          scope: componentScope,
          parentBlueprint: blueprint,
          _rootScope,
          isSVG,
      });
      // ** Check if the children content contains the "_children" keyword.
      // ** Using this allows the content of this child blueprint to use custom content passed into this parent Component.
      // ** E.g
      /*
        const Sub = component("div", null, null, "_children");
        const Main = component("main", null, null, element(Sub, null, "Content"));
    
        Produces:
    
        <main>
          <div>Content</div>
        </main>
      */
      const childBlueprints = resolveChildBlueprints(blueprint, _childBlueprints, isSVG);
      if (element === "<>") {
          blueprint.collection = childBlueprints;
      }
      else {
          blueprint.childBlueprints = childBlueprints;
      }
      checkForErrorsOnBlueprint(blueprint);
      return blueprint;
  };

  const renderEventAttributes = (element, key, value, orderedAttributes, attributes, scope) => {
      // ** Get the function we will run on the listener from the scope.
      const eventFunction = scope[value];
      // ** As the target value is stored inside parenthesis we extract it here.
      // ** e.g (click) -> click
      const target = key.substring(1, key.length - 1);
      const listener = (event) => {
          // ** We do not let undefined mean an absense of a value here because undefined could be an accident.
          // ** We check for null instead as that is not a default value.
          if (eventFunction === undefined) {
              console.error(element);
              throw new Error(`${MINT_ERROR} Event provided is undefined, use instead null to skip, for event '${target}' - '${value}'.`);
          }
          if (eventFunction === null)
              return;
          eventFunction.apply(scope, [event, element, scope]);
      };
      const options = eventFunction === null || eventFunction === void 0 ? void 0 : eventFunction.mintEventOptions;
      element.addEventListener(target, listener, options);
      {
          // ** To make sure this isn't added more than once, remove it once added.
          let index = -1;
          for (let [i, _key] of orderedAttributes.entries()) {
              if (_key === key) {
                  index = i;
              }
          }
          index !== undefined && index !== -1 && orderedAttributes.splice(index, 1);
          delete attributes[key];
      }
  };

  const getValue = (property, scope) => {
      const getter = resolverGetter(property, scope);
      let _value = getter instanceof Function ? getter.apply(scope) : scope[property];
      if (typeof _value === "number") {
          _value = _value.toString();
      }
      return _value;
  };
  const renderBindingAttributes = (element, key, property, scope) => {
      const target = key.substring(1, key.length - 1);
      const _value = getValue(property, scope);
      const newAttributeValue = _value instanceof Function ? _value.apply(scope) : _value;
      /* Dev */
      // _DevLogger_("RENDER", "ATTRIBUTES", target, newAttributeValue);
      if (typeof newAttributeValue === "boolean") {
          element[target] = newAttributeValue;
      }
      else if (attributesThatAreProperties.includes(target)) {
          const value = typeof newAttributeValue === "string"
              ? deBracer(newAttributeValue, scope, "Render - binding property")
              : newAttributeValue;
          // ===
          /*
              For this specific case (setting value on <select> elements).
              The value property does not apply if the option for that value does not exist as a child of the select.
              Therefore the value has to be set after adding the options, which we can do here by waiting until the stack has finished).
            */
          if (target === "value" && element instanceof HTMLSelectElement) {
              setTimeout(() => {
                  element[target] = value;
              }, 0);
          }
          // ===
          else if (value !== undefined) {
              element[target] = value;
          }
      }
      else if (newAttributeValue !== undefined &&
          newAttributeValue !== false &&
          newAttributeValue !== null) {
          element.setAttribute(target, deBracer(newAttributeValue, scope, `Render - binding attribute - (${target}), (${newAttributeValue})`));
      }
  };

  const renderStringAttribute = (element, key, value, scope) => {
      if (typeof value === "boolean") {
          element[key] = value;
      }
      else {
          const newAttributeValue = deBracer(value, scope, `Render - string attribute (${key}), (${value})`);
          element.setAttribute(key, newAttributeValue);
      }
  };

  const setAttribute$1 = (element, key, value, orderedAttributes, attributes, scope) => {
      /* Dev */
      // _DevLogger_("RENDER", "SETATTRIBUTE", key, "|", value, [element]);
      // ** Events are attributes defined like: "(attr)".
      const isEvent = isAttrType(key, "(", ")");
      if (isEvent) {
          renderEventAttributes(element, key, value, orderedAttributes, attributes, scope);
      }
      // ** Value binding attributes are defined like "[attr]".
      const isValueBinding = isAttrType(key, "[", "]");
      if (isValueBinding) {
          renderBindingAttributes(element, key, value, scope);
      }
      {
          const isNormal = !isEvent && !isValueBinding;
          if (isNormal) {
              renderStringAttribute(element, key, value, scope);
          }
      }
  };
  const renderAttributes = (element, orderedAttributes, attributes, scope) => {
      /* DEV */
      // _DevLogger_("RENDER", "ATTRIBUTES", orderedAttributes, { element });
      if (orderedAttributes === null)
          return;
      // <@ REMOVE FOR PRODUCTION
      if (orderedAttributes === undefined)
          throw new Error(`${MINT_ERROR} Attributes cannot be undefined, only null or object`);
      // @>
      // ** Loop over the attributes and add them in turn.
      // ** "set" here refers to all the different types of attributes.
      // ** We clone the attributes here so that the loop will retain the full list of attributes
      // ** even if some are removed during the processing.
      for (let key of [...orderedAttributes]) {
          const value = attributes[key];
          // ** If the attribute here is a mint attribute then ignore that attribute.
          if (attributesToIgnore.includes(key))
              continue;
          // ** If the value is undefined, that is acceptable but no attribute will be added.
          if (value === undefined)
              continue;
          setAttribute$1(element, key, value, orderedAttributes, attributes, scope);
      }
  };

  const renderComponentBlueprint = (blueprint, parentElement, parentChildBlueprints, blueprintIndex) => {
      /* Dev */
      // _DevLogger_("RENDER", "COMPONENT", blueprint);
      var _a, _b, _c, _d, _e;
      const { element, orderedAttributes, attributes, scope, collection, childBlueprints, } = blueprint;
      // ** LIFECYCLE CALL
      (_a = scope.oninit) === null || _a === void 0 ? void 0 : _a.call(scope, { scope });
      (_b = scope.oninsert) === null || _b === void 0 ? void 0 : _b.call(scope, { scope });
      (_c = scope.oneach) === null || _c === void 0 ? void 0 : _c.call(scope, { scope });
      if (element !== undefined) {
          renderAttributes(element, orderedAttributes, attributes, scope);
      }
      // ** Here we add the Component Element to the parentElement, if there is a Component Element.
      if (element !== undefined) {
          addElement(element, parentElement, parentChildBlueprints, blueprintIndex);
      }
      // ** Here we add the collection of Component Elements if there is a collection.
      if (collection !== undefined) {
          for (let x of collection) {
              renderBlueprints([x], parentElement, parentChildBlueprints, [
                  blueprintIndex,
              ]);
          }
      }
      // ** Here we handle the children of this Component, if it has any.
      if (!!childBlueprints) {
          renderBlueprints(childBlueprints, element !== null && element !== void 0 ? element : parentElement);
      }
      // ** LIFECYCLE CALL
      (_d = scope.onafterinsert) === null || _d === void 0 ? void 0 : _d.call(scope, { scope });
      (_e = scope.onaftereach) === null || _e === void 0 ? void 0 : _e.call(scope, { scope });
      return;
  };

  // ** It's not super easy to reason how to get the parentBlueprint of
  // ** of a Blueprint and so we put that logic here.
  const getParentElement = (blueprint) => {
      const { parentBlueprint } = blueprint;
      const { _rootElement } = blueprint._rootScope;
      if (parentBlueprint === null)
          return _rootElement;
      const { element } = parentBlueprint;
      if (element !== undefined)
          return element;
      return getParentElement(parentBlueprint);
  };

  const refreshBlueprint = (blueprint, options) => {
      const parentElement = getParentElement(blueprint);
      /* Dev */
      // _DevLogger_("REFRESH", "Blueprint", blueprint);
      const focusTarget = document.activeElement;
      if (blueprint.mintNode === null) {
          if (blueprint.refresh) {
              blueprint.refresh(blueprint, { newlyInserted: options.newlyInserted });
          }
          return;
      }
      const _refresh = blueprint.mintNode.refresh;
      _refresh(blueprint, parentElement, options);
      // ** Here we check if the Element that was refreshed was the activeElement (had focus).
      // ** If it was then we re add the focus if it has been lost.
      if (focusTarget !== null &&
          focusTarget !== document.activeElement &&
          document.body.contains(focusTarget)) {
          focusTarget.focus();
      }
  };
  const refreshBlueprints = (blueprints, options) => {
      for (let blueprint of blueprints) {
          refreshBlueprint(blueprint, options);
      }
  };

  const getOldValue = (target, element) => {
      if (attributesThatAreProperties.includes(target)) {
          return element[target];
      }
      return element.getAttribute(target);
  };
  const refreshBindingAttributes = (element, key, value, scope) => {
      const target = key.substring(1, key.length - 1);
      const oldAttributeValue = getOldValue(target, element);
      const _value = resolvePropertyLookup(value, scope);
      const newAttributeValue = _value instanceof Function ? _value.apply(scope) : _value;
      if (oldAttributeValue === newAttributeValue) {
          return;
      }
      if (typeof newAttributeValue === "boolean") {
          element[target] = newAttributeValue;
      }
      else if (attributesThatAreProperties.includes(target)) {
          const value = typeof newAttributeValue === "string"
              ? deBracer(newAttributeValue, scope, "Refresh - binding property")
              : newAttributeValue;
          // ===
          /*
              For this specific case (setting value on <select> elements).
              The value property does not apply if the option for that value does not exist as a child of the select.
              Therefore the value has to be set after adding the options, which we can do here by waiting until the stack has finished).
            */
          if (target === "value" && element instanceof HTMLSelectElement) {
              setTimeout(() => {
                  element[target] = value;
              }, 0);
          }
          // ===
          // ===
          /*
            For the case where the property needs to be set as a boolean but is not a boolean value
            do that here.
            For example setting checked on Input type checkbox.1
          */
          else if (attributesThatAreBoolean.includes(target)) {
              element[target] = !!value;
          }
          // ===
          else if (value !== undefined) {
              element[target] = value;
          }
      }
      else if (newAttributeValue === undefined || newAttributeValue === null) {
          element.removeAttribute(target);
      }
      else {
          element.setAttribute(target, deBracer(newAttributeValue, scope, "Refresh - binding attribute"));
      }
  };

  const refreshStringAttribute = (element, key, value, scope) => {
      const oldAttributeValue = element.getAttribute(key);
      if (oldAttributeValue === value) {
          return;
      }
      if (typeof value === "boolean") {
          element[key] = value;
      }
      else if (value === undefined) {
          element.removeAttribute(key);
      }
      else {
          const newAttributeValue = deBracer(value, scope, "Refresh - string attribute");
          if (oldAttributeValue === newAttributeValue) {
              return;
          }
          element.setAttribute(key, newAttributeValue);
      }
  };

  const setAttribute = (element, key, value, scope) => {
      /* Dev */
      // _DevLogger_("REFRESH", "SETATTRIBUTE: ", key, "|", value);
      if (isAttrType(key, "(", ")")) {
          console.error("Event handler attribute was present in refresh");
          console.trace();
      }
      if (isAttrType(key, "[", "]")) {
          refreshBindingAttributes(element, key, value, scope);
      }
      else {
          refreshStringAttribute(element, key, value, scope);
      }
  };
  const refreshAttributes = (element, orderedAttributes, attributes, scope) => {
      /* DEV */
      // _DevLogger_("REFRESH", "ATTRIBUTES: ", orderedAttributes, { element });
      for (let key of orderedAttributes) {
          const value = attributes[key];
          if (attributesToIgnore.includes(key))
              continue;
          setAttribute(element, key, value, scope);
      }
  };

  const resolveMAttributesOnRefresh = (blueprint, parentElement, options) => {
      const { orderedProps = [], props = {}, orderedAttributes = [], attributes = {}, } = blueprint;
      let shouldExit = { condition: false, value: undefined };
      for (let key of orderedProps) {
          const property = props[key];
          const resolver = property.onRefresh;
          if (shouldExit.condition === false &&
              property instanceof MintAttribute &&
              resolver instanceof Function) {
              shouldExit = resolver.apply(property, [
                  blueprint,
                  parentElement,
                  options,
              ]);
          }
      }
      for (let key of orderedAttributes) {
          const property = attributes[key];
          const resolver = property.onRefresh;
          if (shouldExit.condition === false &&
              property instanceof MintAttribute &&
              resolver instanceof Function) {
              shouldExit = resolver.apply(property, [
                  blueprint,
                  parentElement,
                  options,
              ]);
          }
      }
      return shouldExit;
  };

  const refreshComponentBlueprint = (blueprint, parentElement, options) => {
      /* Dev */
      // _DevLogger_("REFRESH", "COMPONENT: ", blueprint);
      var _a, _b, _c, _d, _e;
      const { element, orderedProps, props, orderedAttributes, attributes, scope, parentBlueprint, collection, childBlueprints, } = blueprint;
      applyScopeTransformers(scope);
      {
          const parentScope = (_a = parentBlueprint === null || parentBlueprint === void 0 ? void 0 : parentBlueprint.scope) !== null && _a !== void 0 ? _a : blueprint._rootScope;
          assignProps(scope, orderedProps, props, parentScope);
      }
      const shouldReturn = resolveMAttributesOnRefresh(blueprint, parentElement, options);
      if (shouldReturn.condition) {
          return shouldReturn;
      }
      // ** LIFECYCLE CALL
      options.newlyInserted && ((_b = scope.oninsert) === null || _b === void 0 ? void 0 : _b.call(scope, { scope }));
      (_c = scope.oneach) === null || _c === void 0 ? void 0 : _c.call(scope, { scope });
      if (element !== undefined && !(element instanceof Text)) {
          refreshAttributes(element, orderedAttributes, attributes, scope);
      }
      if (!!collection) {
          refreshBlueprints(collection, options);
      }
      if (!!childBlueprints) {
          refreshBlueprints(childBlueprints, options);
      }
      // ** LIFECYCLE CALL
      options.newlyInserted && ((_d = scope.onafterinsert) === null || _d === void 0 ? void 0 : _d.call(scope, { scope }));
      (_e = scope.onaftereach) === null || _e === void 0 ? void 0 : _e.call(scope, { scope });
      return shouldReturn;
  };

  class MintComponent extends MintNode {
      constructor(element, attributes, content, scope) {
          super(content, generateComponentBlueprint, renderComponentBlueprint, refreshComponentBlueprint);
          this.element = element;
          this.attributes = attributes !== null && attributes !== void 0 ? attributes : {};
          this.scope = scope;
          if (scope === null || scope === void 0 ? void 0 : scope._propTypes) {
              this.propTypes = scope._propTypes;
          }
      }
      clone() {
          var _a;
          const content = [];
          for (let x of this.content) {
              content.push(cloneContent(x));
          }
          const cloned = new MintComponent((_a = this.element) !== null && _a !== void 0 ? _a : "<>", Object.assign({}, this.attributes), content, this.scope);
          return cloned;
      }
  }

  const component = (element, scope = null, attributes = null, initialContent = null) => {
      // <@ REMOVE FOR PRODUCTION
      if (element === "<>" && typeof initialContent === "string") {
          throw new Error(`${MINT_ERROR} Cannot define content as 'string' when Component is a Fragment (<>).`);
      }
      // @>
      // <@ REMOVE FOR PRODUCTION
      if (!!(attributes === null || attributes === void 0 ? void 0 : attributes.mIf)) {
          throw new Error(`${MINT_ERROR} Cannot add mIf directly to Components attribute in Component definition.`);
      }
      // @>
      // <@ REMOVE FOR PRODUCTION
      if (!!(attributes === null || attributes === void 0 ? void 0 : attributes.mFor)) {
          throw new Error(`${MINT_ERROR} Cannot add mFor directly to Components attribute in Component definition.`);
      }
      // @>
      const content = createMintText(initialContent);
      return new MintComponent(element, attributes, content, scope);
  };

  class TemplateBlueprint extends Blueprint {
      constructor({ mintNode, fragment, templateState, scope, parentBlueprint, _rootScope, }) {
          super({
              mintNode,
              scope,
              parentBlueprint,
              _rootScope,
          });
          if (!!fragment)
              this.fragment = fragment;
          this.templateState = templateState;
          this._dev = "Template";
      }
  }

  const generateMTemplate = ({ node, scope, parentBlueprint, _rootScope, }) => {
      const mintNode = node.mintNode;
      const mintTemplate = mintNode;
      return new TemplateBlueprint({
          mintNode: mintTemplate,
          templateState: null,
          scope,
          parentBlueprint,
          _rootScope,
      });
  };

  const renderMTemplate = (blueprint, parentElement, parentChildBlueprints, blueprintIndex) => {
      const { mintNode, scope, parentBlueprint, _rootScope } = blueprint;
      let { options, templateGenerator, scopeLookup } = mintNode;
      if (scopeLookup !== undefined) {
          templateGenerator = scope[scopeLookup];
          // <@ REMOVE FOR PRODUCTION
          if (!(templateGenerator instanceof Function)) {
              throw new Error(`${MINT_ERROR} -- node(template("target")) -- No function provided from "target". Make sure you write () => TMintContent not just TMintContent`);
          }
          // @>
      }
      const { conditionedBy } = options;
      blueprint.templateState = conditionedBy && scope[conditionedBy];
      const template = templateGenerator.apply(scope);
      let content;
      if (template instanceof Array) {
          content = template;
      }
      else {
          content = [template];
      }
      const collection = generateBlueprints({
          nodes: content,
          scope,
          parentBlueprint,
          _rootScope,
      });
      // <@ REMOVE FOR PRODUCTION
      if (!!collection.find((x) => x instanceof TextBlueprint && x.textValue === "_children")) {
          throw new Error(`${MINT_ERROR} cannot add "_children" as a child of mTemplate template.`);
      }
      // @>
      for (let x of collection) {
          renderBlueprints([x], parentElement, parentChildBlueprints, [
              blueprintIndex,
          ]);
      }
      blueprint.collection = collection;
  };

  const getAllElements = (blueprints) => {
      const allElements = [];
      for (let x of blueprints) {
          if (x.element instanceof Element) {
              allElements.push(x.element);
              continue;
          }
          if (x.collection instanceof Array) {
              allElements.push(...getAllElements(x.collection));
              continue;
          }
      }
      return allElements;
  };

  const fillOutElements = (blueprintList, initialBlueprint) => {
      const output = [];
      const a = output;
      for (let x of blueprintList) {
          const b = x;
          if (b !== initialBlueprint && b.fragment) {
              if (!!b.childBlueprints) {
                  a.push(...fillOutElements(b.childBlueprints, initialBlueprint));
              }
              if (!!b.collection) {
                  a.push(...fillOutElements(b.collection, initialBlueprint));
              }
          }
          else {
              a.push(b);
          }
      }
      return output;
  };
  // ** Here we take a Blueprint and find the index among the parent content so that
  // ** we can insert the Blueprint content correctly amongst it.
  const getBlueprintIndex = (blueprint, initialBlueprint = blueprint) => {
      const { parentBlueprint } = blueprint;
      const { _rootChildBlueprints } = blueprint._rootScope;
      let blueprintList, blueprintIndex;
      if (parentBlueprint === null) {
          blueprintList = fillOutElements(_rootChildBlueprints, initialBlueprint);
          blueprintIndex = _rootChildBlueprints.indexOf(blueprint);
          return { blueprintList, blueprintIndex };
      }
      const { fragment, collection, childBlueprints } = parentBlueprint;
      if (fragment) {
          return getBlueprintIndex(parentBlueprint, initialBlueprint);
      }
      if (childBlueprints !== undefined) {
          blueprintList = childBlueprints;
      }
      if (collection !== undefined) {
          blueprintList = collection;
      }
      blueprintList = fillOutElements(blueprintList, initialBlueprint);
      blueprintIndex = blueprintList.indexOf(initialBlueprint);
      /* DEV */
      // _DevLogger_("REFRESH", "INDEX", blueprint, blueprintIndex);
      return { blueprintList, blueprintIndex };
  };

  const conductRefresh = (blueprint) => {
      var _a;
      const { collection } = blueprint;
      const parentElement = getParentElement(blueprint);
      const { blueprintList: parentBlueprintList, blueprintIndex } = getBlueprintIndex(blueprint);
      const allElements = getAllElements(collection);
      for (let x of allElements) {
          (_a = x.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(x);
      }
      renderMTemplate(blueprint, parentElement, parentBlueprintList, blueprintIndex);
  };
  const refreshMTemplate = (blueprint) => {
      const { collection, scope, templateState, mintNode } = blueprint;
      const { options: { conditionedBy, onevery }, } = mintNode;
      // ** If there is no content to add; DO NOTHING
      if (collection === undefined)
          return { condition: false };
      // ** If we want to refresh every time then DO that here and end.
      if (onevery === true) {
          conductRefresh(blueprint);
          return { condition: false };
      }
      if (conditionedBy !== undefined) {
          const newTemplateState = resolvePropertyLookup(conditionedBy, scope);
          // ** If the conditional state hasn't changed: DO NOTHING
          if (templateState === newTemplateState)
              return { condition: false };
          // ** Update the state for next time.
          blueprint.templateState = newTemplateState;
          conductRefresh(blueprint);
          return { condition: false };
      }
      return { condition: false };
  };

  class MintTemplate extends MintNode {
      constructor(optionsOrGeneratorOrScopeLookup, templateGeneratorOrScopeLookup) {
          super(null, generateMTemplate, renderMTemplate, refreshMTemplate);
          if (templateGeneratorOrScopeLookup !== undefined) {
              this.options = optionsOrGeneratorOrScopeLookup;
              if (typeof templateGeneratorOrScopeLookup === "string") {
                  this.scopeLookup = templateGeneratorOrScopeLookup;
              }
              else {
                  this.templateGenerator = templateGeneratorOrScopeLookup;
              }
          }
          else {
              this.options = {
                  onevery: true,
              };
              if (typeof optionsOrGeneratorOrScopeLookup === "string") {
                  this.scopeLookup = optionsOrGeneratorOrScopeLookup;
              }
              else {
                  this.templateGenerator = optionsOrGeneratorOrScopeLookup;
              }
          }
      }
      addChildren() { }
      addProperties() { }
  }

  const template = (optionsOrGenerator, templateGenerator) => {
      return new MintTemplate(optionsOrGenerator, templateGenerator);
  };

  class ElementBlueprint extends Blueprint {
      constructor({ mintNode, fragment, element, orderedAttributes, attributes, scope, parentBlueprint, _rootScope, collection, childBlueprints, }) {
          super({
              mintNode,
              scope,
              parentBlueprint,
              _rootScope,
          });
          if (!!fragment)
              this.fragment = fragment;
          if (!!element)
              this.element = element;
          this.orderedAttributes = orderedAttributes;
          this.attributes = attributes;
          if (!!collection)
              this.collection = collection;
          if (!!childBlueprints)
              this.childBlueprints = childBlueprints;
          if (element instanceof SVGElement)
              this.isSVG = true;
          this._dev = "Element";
      }
  }

  const generateElementBlueprint = ({ node, orderedProps: orderedAttributes, props: attributes, scope, parentBlueprint, _rootScope, isSVG, }) => {
      // ** This Function can only be accessed  by MintElement so tell TS that here.
      const mintElement = node.mintNode;
      const { element, content } = mintElement;
      // ** We to check for SVG, which we do here.
      // ** Child Elements of SVG are all SVG Elements as well so it stays true from here downwards.
      element === "svg" && (isSVG = true);
      let newHTMLElement = undefined;
      // ** Check for Fragments.
      if (element !== undefined && element !== "<>") {
          // ** Create the new Element in JS
          // ** SVG Elements are slightly different and are created differently here.
          newHTMLElement = isSVG
              ? // ** An SVGElement is different to a HTMLElement, it is older and needs a different method to be created.
                  document.createElementNS("http://www.w3.org/2000/svg", element)
              : // ** Create a new HTMLElment.
                  document.createElement(element);
      }
      {
          // ** Here we resolve the attributes of the element.
          // ** If one of the mAttributes on the list means we stop generating here then detect that.
          const shouldReturn = resolveMAttributesOnGenerate({
              orderedProps: orderedAttributes !== null && orderedAttributes !== void 0 ? orderedAttributes : [],
              props: attributes !== null && attributes !== void 0 ? attributes : {},
              htmlElement: newHTMLElement,
              node,
              parentScope: scope,
              scope,
              _children: null,
              parentBlueprint,
              _rootScope,
              isSVG,
              isComponent: false,
              isAttribute: true,
          });
          if (shouldReturn.condition) {
              return shouldReturn.value;
          }
      }
      const blueprint = new ElementBlueprint({
          mintNode: mintElement,
          fragment: element === "<>" || undefined,
          element: newHTMLElement,
          orderedAttributes: orderedAttributes !== null && orderedAttributes !== void 0 ? orderedAttributes : [],
          attributes: attributes !== null && attributes !== void 0 ? attributes : {},
          scope,
          parentBlueprint,
          _rootScope,
      });
      /* Dev */
      // _DevLogger_("GENERATE", "ELEMENT", blueprint);
      const _childBlueprints = [];
      // ** Here we produce the content of the children of this Element.
      if (content !== undefined) {
          _childBlueprints.push(...generateBlueprints({
              nodes: content,
              scope,
              parentBlueprint: blueprint,
              _rootScope,
              isSVG,
          }));
      }
      // ** Check if the children content contains the "_children" keyword.
      // ** Using this allows the content of this child blueprint to use custom content passed into this parent Component.
      // ** E.g
      /*
        const Sub = component("div", null, null, "_children");
        const Main = component("main", null, null, element(Sub, null, "Content"));
    
        Produces:
    
        <main>
          <div>Content</div>
        </main>
      */
      const childBlueprints = resolveChildBlueprints(blueprint, _childBlueprints, isSVG);
      if (element === "<>") {
          blueprint.collection = childBlueprints;
      }
      else {
          blueprint.childBlueprints = childBlueprints;
      }
      checkForErrorsOnBlueprint(blueprint);
      return blueprint;
  };

  const renderElementBlueprint = (blueprint, parentElement, parentChildBlueprints, blueprintIndex) => {
      const { element, orderedAttributes, attributes, scope, collection, childBlueprints, } = blueprint;
      /* Dev */
      // _DevLogger_("RENDER", "ELEMENT", blueprint, blueprintIndex);
      if (element !== undefined) {
          renderAttributes(element, orderedAttributes, attributes, scope);
      }
      // ** Here we add the Element to the parentElement, if there is an Element.
      if (element !== undefined) {
          addElement(element, parentElement, parentChildBlueprints, blueprintIndex);
      }
      // ** Here we add the collection of Elements if there is a collection.
      if (collection !== undefined) {
          for (let x of collection) {
              renderBlueprints([x], parentElement, parentChildBlueprints, [
                  blueprintIndex,
              ]);
          }
      }
      // ** Here we handle the children of this Element, if it has any.
      if (!!childBlueprints) {
          renderBlueprints(childBlueprints, element !== null && element !== void 0 ? element : parentElement);
      }
  };

  const refreshElementBlueprint = (blueprint, parentElement, options) => {
      /* Dev */
      // _DevLogger_("REFRESH", "ELEMENT", blueprint);
      const { element, collection, orderedAttributes, attributes, scope, childBlueprints, } = blueprint;
      const shouldReturn = resolveMAttributesOnRefresh(blueprint, parentElement, options);
      if (shouldReturn.condition) {
          return shouldReturn;
      }
      if (element !== undefined && !(element instanceof Text)) {
          refreshAttributes(element, orderedAttributes, attributes, scope);
      }
      if (!!collection) {
          refreshBlueprints(collection, options);
      }
      if (!!childBlueprints) {
          refreshBlueprints(childBlueprints, options);
      }
      return shouldReturn;
  };

  class MintElement extends MintNode {
      constructor(element, 
      // props: null | IProps = null,
      attributes = null, content) {
          super(content, generateElementBlueprint, renderElementBlueprint, refreshElementBlueprint);
          this.element = element;
          // this.props = props ?? {};
          this.attributes = attributes !== null && attributes !== void 0 ? attributes : {};
      }
      clone() {
          var _a;
          const content = [];
          for (let x of this.content) {
              content.push(cloneContent(x));
          }
          return new MintElement((_a = this.element) !== null && _a !== void 0 ? _a : "<>", 
          // Object.assign({}, this.props),
          Object.assign({}, this.attributes), content);
      }
  }

  const node = (element, props = null, initialContent = null) => {
      // <@ REMOVE FOR PRODUCTION
      if (element === "<>" && props !== null) {
          const acceptableProps = ["mIf", "mFor", "mKey"];
          const keys = [];
          for (let x of Object.keys(props)) {
              if (!acceptableProps.includes(x))
                  keys.push(x);
          }
          if (keys.length > 0) {
              console.warn(`${MINT_WARN} Defining a Fragment with attributes i.e node("<>", { ${keys.join(", ")} }) means these attributes will be ignored on render.`);
          }
      }
      // @>
      let mintNode;
      const content = createMintText(initialContent);
      if (typeof element === "string") {
          mintNode = new MintElement(element, props, content);
      }
      else {
          mintNode = element;
          // (element as MintComponent)._children = content;
      }
      return new CreateNode(mintNode, props, content);
  };

  class Store {
      constructor(initialData) {
          if (!(initialData instanceof Object)) {
              throw "You must provide an Object to create a new Store.";
          }
          const entries = Object.entries(initialData);
          for (let [key, value] of entries) {
              if (value instanceof ScopeTransformer) {
                  value.transform(this, key);
              }
              else {
                  this[key] = value;
              }
          }
          this._component = null;
          this._keys = Object.keys(initialData);
          this._data = initialData;
          Object.seal(this);
      }
      connect(scope) {
          this._component = scope;
          scope._store = this;
          for (let key of this._keys) {
              const value = this._data[key];
              if (value instanceof ScopeTransformer) {
                  value.transform(scope, key);
              }
              else {
                  Object.defineProperty(scope, key, {
                      get: () => this[key],
                      set: (_value) => (this[key] = _value),
                  });
              }
          }
      }
  }

  const externalRefreshBlueprint = (scopeOrBlueprint) => {
      var _a;
      const blueprint = scopeOrBlueprint instanceof Blueprint
          ? scopeOrBlueprint
          : scopeOrBlueprint instanceof Store
              ? (_a = scopeOrBlueprint._component) === null || _a === void 0 ? void 0 : _a._mintBlueprint
              : scopeOrBlueprint._mintBlueprint;
      // <@ REMOVE FOR PRODUCTION
      if (blueprint === undefined) {
          throw new Error(`${MINT_ERROR} refresh called using an invalid scope. Blueprint is undefined.`);
      }
      // @>
      if (currentlyTracking.updating(blueprint)) {
          console.warn(`${MINT_WARN} refresh() detected while still templating, refresh ignored.`);
          return;
      }
      currentlyTracking.addBlueprint(blueprint);
      refreshBlueprints([blueprint], { newlyInserted: false });
      currentlyTracking.removeBlueprint(blueprint);
  };
  const externalRefresh = (target) => {
      let arr = [];
      /* Dev */
      // _DevLogger_("REFRESH: ", "target", target);
      if (!(target instanceof Array)) {
          arr = [target];
      }
      else {
          arr = target;
      }
      for (let each of arr) {
          externalRefreshBlueprint(each);
      }
  };

  /******************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */

  function __rest(s, e) {
      var t = {};
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
          t[p] = s[p];
      if (s != null && typeof Object.getOwnPropertySymbols === "function")
          for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
              if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                  t[p[i]] = s[p[i]];
          }
      return t;
  }

  typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
      var e = new Error(message);
      return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
  };

  const generateMExtend = ({ extension, orderedProps, props, parentScope, scope, }) => {
      // ** Here we use the "mExtend" tool to extract an Object from the scope and extend the
      // ** attributes used in the Render of that Element.
      const _extension = typeof extension === "string" ? parentScope[extension] : extension;
      //<@ REMOVE FOR PRODUCTION
      if (!(_extension instanceof Object)) {
          throw new Error("Render -- Element -- mExtend -- Something other than an Object was set on mExtend.");
      }
      //@>
      // ** Set the values here.
      for (let [key, value] of Object.entries(_extension)) {
          //<@ REMOVE FOR PRODUCTION
          if (key === "mExtend") {
              throw new Error("Render -- Element -- mExtend -- Property of mExtend found on extension object. This will cause a cyclicular error.");
          }
          //@>
          orderedProps.push(key);
          props[key] = value;
      }
      assignProps(scope, Object.keys(_extension), _extension, parentScope);
      return {
          condition: false,
          value: undefined,
      };
  };

  class MintExtend extends MintAttribute {
      constructor(extension) {
          super(() => new MintExtend(extension));
          this.extension = extension;
          this.onGenerate = function (_a) {
              var args = __rest(_a, []);
              const { extension } = this;
              return generateMExtend(Object.assign({ extension }, args));
          };
      }
  }

  const mExtend = (extension) => {
      return { mExtend: new MintExtend(extension) };
  };

  class IfBlueprint extends Blueprint {
      constructor({ mintNode, orderedProps, props, scope, parentBlueprint, _rootScope, content, isSVG, }) {
          super({
              mintNode,
              scope,
              parentBlueprint,
              _rootScope,
          });
          this.orderedProps = orderedProps;
          this.props = props;
          this.content = content;
          if (!!isSVG)
              this.isSVG = isSVG;
          this._dev = "If";
      }
  }

  const generateMIf = ({ mIfInstance, _ifValue, node, orderedProps, props, parentScope, parentBlueprint, _rootScope, isSVG, }) => {
      const { mintNode, content } = node;
      const mintElement = mintNode;
      // <@ REMOVE FOR PRODUCTION
      if (_ifValue.includes(" ")) {
          console.warn(`${MINT_WARN} mIf value defined with a space, this may be a mistake. Value: "${_ifValue}".`);
      }
      // @>
      if (mIfInstance._mIf !== undefined) {
          throw new Error("");
      }
      const inverse = _ifValue.charAt(0) === "!";
      const ifValue = inverse ? _ifValue.substring(1) : _ifValue;
      const result = resolvePropertyLookup(ifValue, parentScope);
      const state = inverse ? !result : !!result;
      mIfInstance._mIf = {
          inverse,
          ifValue,
          state,
          scope: parentScope,
          blueprinted: state,
          mintNode: mintNode,
      };
      /* Dev */
      // _DevLogger_("GENERATE", "mIf", mIfInstance._mIf);
      if (mIfInstance._mIf.state === false) {
          mIfInstance.blueprint = new IfBlueprint({
              mintNode: mintElement,
              orderedProps,
              props: props !== null && props !== void 0 ? props : {},
              scope: parentScope,
              parentBlueprint,
              _rootScope,
              content,
              isSVG,
          });
          /* Dev */
          // _DevLogger_("GENERATE", "mIf", that.blueprint, parentBlueprint);
          return { condition: true, value: mIfInstance.blueprint };
      }
      return { condition: false, value: undefined };
  };

  // ** This function takes a list of Blueprints and remove their content from
  // ** their parent HTMLElement.
  const removeList = (list) => {
      var _a;
      for (let x of list) {
          const { element, collection } = x;
          if (element !== undefined) {
              (_a = element.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(element);
          }
          if (collection !== undefined) {
              removeList(collection);
          }
      }
  };

  const resolveState = (mIf) => {
      const { ifValue, inverse, scope } = mIf;
      const result = resolvePropertyLookup(ifValue, scope);
      return inverse ? !result : !!result;
  };
  const fromFalseNotBlueprintedToTrue = (blueprint, parentElement, options) => {
      let newBlueprint = blueprint;
      const { mIf, newState, newlyInserted } = options;
      const ifBlueprint = blueprint;
      const { _rootScope } = blueprint;
      const { mintNode, parentBlueprint, scope, isSVG } = ifBlueprint;
      const cloneMintContent = new CreateNode(mintNode, ifBlueprint.props, ifBlueprint.content);
      [newBlueprint] = generateBlueprints({
          nodes: [cloneMintContent],
          scope,
          parentBlueprint,
          _rootScope,
          isSVG,
      });
      // ** We need to replace this previous IfBlueprint as its not longer the correct context.
      if (parentBlueprint !== null) {
          // ** When not at root element
          const { childBlueprints, collection } = parentBlueprint;
          if (childBlueprints !== undefined) {
              // ** Child blueprints
              let index = -1;
              for (let [i, x] of childBlueprints.entries()) {
                  if (x === ifBlueprint) {
                      index = i;
                  }
              }
              childBlueprints.splice(index, 1, newBlueprint);
          }
          if (collection !== undefined) {
              // ** Collection
              let index = -1;
              for (let [i, x] of collection.entries()) {
                  if (x === ifBlueprint) {
                      index = i;
                  }
              }
              collection.splice(index, 1, newBlueprint);
          }
      }
      else {
          // ** When at root element.
          const { _rootChildBlueprints } = blueprint._rootScope;
          let index = -1;
          for (let [i, x] of _rootChildBlueprints.entries()) {
              if (x === ifBlueprint) {
                  index = i;
              }
          }
          _rootChildBlueprints.splice(index, 1, newBlueprint);
      }
      mIf.blueprinted = true;
      const { blueprintList, blueprintIndex } = getBlueprintIndex(newBlueprint);
      parentElement !== undefined &&
          renderBlueprints([newBlueprint], parentElement, blueprintList, [
              blueprintIndex,
          ]);
      return { newState, newlyInserted };
  };
  const fromFalseToTrue = (blueprint, parentElement, parentBlueprintList, blueprintIndex) => {
      const { element, collection } = blueprint;
      if (element !== undefined) {
          addElement(element, parentElement, parentBlueprintList, blueprintIndex);
      }
      if (collection !== undefined) {
          for (let x of collection) {
              renderBlueprints([x], parentElement, parentBlueprintList, [
                  blueprintIndex,
              ]);
          }
      }
  };
  const fromTrueToFalse = (blueprint) => {
      removeList([blueprint]);
  };
  const stateShift = (blueprint, parentElement, parentBlueprintList, blueprintIndex, mIf) => {
      if (mIf === undefined)
          return {};
      const oldState = mIf.state;
      mIf.state = resolveState(mIf);
      const newState = mIf.state;
      let newlyInserted = false;
      /* Dev */
      // _DevLogger_("REFRESH", "mIf: ", mIf, oldState, newState);
      // ** Change in state -> Do something
      if (oldState !== newState) {
          // ** Is now TRUE
          if (newState === true) {
              newlyInserted = true;
              // ** WAS NOT previously rendered -> Add
              if (mIf.blueprinted === false) {
                  // ** WAS NOT previously blueprinted -> Blueprint first, then Add
                  return fromFalseNotBlueprintedToTrue(blueprint, parentElement, {
                      mIf,
                      newState,
                      newlyInserted,
                  });
              }
              else {
                  // ** WAS previously blueprinted -> Add back
                  fromFalseToTrue(blueprint, parentElement, parentBlueprintList, blueprintIndex);
              }
          }
          // ** Is now FALSE
          else if (blueprint instanceof Blueprint) {
              // ** WAS previously rendered -> Remove
              fromTrueToFalse(blueprint);
          }
      }
      return { newState, newlyInserted };
  };
  const refreshMIf = (mIf, blueprint, parentElement, options) => {
      const { blueprintList: parentBlueprintList, blueprintIndex } = getBlueprintIndex(blueprint);
      const oldBlueprinted = mIf.blueprinted;
      const { newState, newlyInserted } = stateShift(blueprint, parentElement, parentBlueprintList, blueprintIndex, mIf);
      options.newlyInserted = newlyInserted !== null && newlyInserted !== void 0 ? newlyInserted : false;
      if (oldBlueprinted === false && newState === true) {
          return { condition: true, value: blueprint };
      }
      if (newState === false)
          return { condition: true, value: blueprint };
      return { condition: false, value: undefined };
  };

  const renderMIf = (blueprint, mIf) => {
      if (blueprint === null)
          return { condition: false, value: undefined };
      if (mIf.blueprinted === false && mIf.state === false) {
          return { condition: true, value: blueprint };
      }
      return { condition: false, value: undefined };
  };

  class MintIf extends MintAttribute {
      constructor(ifValue) {
          super(() => new MintIf(ifValue));
          this.onGenerate = function (_a) {
              var args = __rest(_a, []);
              const that = this;
              return generateMIf(Object.assign({ mIfInstance: that, _ifValue: ifValue }, args));
          };
          this.onRender = function (blueprint) {
              const { _mIf } = this;
              return renderMIf(blueprint, _mIf);
          };
          this.onRefresh = function (blueprint, parentElement, options) {
              const { _mIf } = this;
              return refreshMIf(_mIf, blueprint, parentElement, options);
          };
      }
  }

  const mIf = (ifValue) => {
      return { mIf: new MintIf(ifValue) };
  };

  //  ** Creates a function that will check against a property target and return if unique.
  const checkUniqueService = (key) => {
      // ** item is an item in arr and arr is the full list of items.
      // ** index is the index of item in arr.
      return (item, index, arr) => {
          // ** This is IMPORTANT
          // ** When using the index we ignore checking for uniqueness because it will always be unique.
          if (key === "_i")
              return true;
          const value = item[key];
          {
              for (let [i, x] of arr.entries()) {
                  // ** Find the first value on the arr that matches the provided value.
                  if (x[key] === value) {
                      // ** If they are at the same index then alls fine.
                      if (index === i) {
                          return true;
                      }
                      // ** If the indexes are wrong it means that there is another value with
                      // ** the same value and therefore a duplicate and this is not unique.
                      else {
                          return false;
                      }
                  }
              }
          }
          return false;
      };
  };

  /*
    This is a very important Function.
    When passing an Array of Objects to a mFor we need to go over the data of each
    Object and add the parent scope into the data.
    We do this by creating a new Object and adding the parent scope as the prototype.
    Importantly we then define the for each data using Object.defineProperty
    instead of newScope.property = value otherwise the parent would change instead,
    leaving the parent scope with the last Array property value and with each in the for
    using that property too.
  */
  const createForData = (data, scope, index) => {
      const Data = function _ForData() {
          this._x = data;
          this._i = index;
      };
      Data.prototype = scope;
      const newScope = new Data();
      if (data instanceof Object) {
          const entries = Object.entries(data);
          for (let [key, value] of entries) {
              Object.defineProperty(newScope, key, {
                  // ** Set the value
                  value,
                  // ** Can it be edited
                  writable: true,
                  // ** Will it be loopable e.g is shown in Object.entries
                  enumerable: true,
                  // ** Can it be deleted from this object
                  configurable: true,
              });
          }
      }
      return newScope;
  };

  const generatemForBlueprint = (nodeToClone, scope, orderedProps, props, _children, parentBlueprint, data, index, _rootScope, isSVG = false) => {
      var _a, _b;
      if (data instanceof Blueprint)
          return data;
      let newScope;
      if (!!nodeToClone.scope) {
          newScope = new ((_a = nodeToClone.scope) !== null && _a !== void 0 ? _a : MintScope)();
          assignProps(newScope, orderedProps, props, scope);
      }
      else {
          newScope = scope || new MintScope();
      }
      applyScopeTransformers(newScope);
      const _scope = createForData(data, newScope, index);
      if (!!nodeToClone.scope) {
          assignProps(newScope, orderedProps, props, _scope);
      }
      const mintElementClone = nodeToClone.clone();
      if (!!mintElementClone.attributes) {
          delete mintElementClone.attributes.mFor;
          delete mintElementClone.attributes.mKey;
          delete mintElementClone.attributes.mForType;
      }
      const cloneMintNode = new CreateNode(mintElementClone, (_b = mintElementClone.attributes) !== null && _b !== void 0 ? _b : null, _children);
      cloneMintNode.props = Object.assign({}, props);
      delete cloneMintNode.props.mFor;
      delete cloneMintNode.props.mKey;
      delete cloneMintNode.props.mForType;
      const [blueprint] = generateBlueprints({
          nodes: [cloneMintNode],
          scope: _scope,
          parentBlueprint,
          _rootScope,
          isSVG,
          useGivenScope: true,
      });
      return blueprint;
  };

  class ForBlueprint extends Blueprint {
      constructor({ 
      // mintNode,
      render, refresh, nodeToClone, fragment, orderedProps, props, scope, parentBlueprint, forListBlueprints, 
      // collection,
      _rootScope, isSVG, }) {
          super({ render, refresh, scope, parentBlueprint, _rootScope });
          this.nodeToClone = nodeToClone;
          if (!!fragment)
              this.fragment = fragment;
          this.orderedProps = orderedProps;
          this.props = props;
          this.forListBlueprints = forListBlueprints;
          // this.collection = collection;
          if (!!isSVG)
              this.isSVG = isSVG;
          this._dev = "For";
      }
  }

  var FOR_Type;
  (function (FOR_Type) {
      FOR_Type[FOR_Type["default"] = 0] = "default";
      FOR_Type[FOR_Type["match"] = 1] = "match";
  })(FOR_Type || (FOR_Type = {}));

  const recycleMForData = (currentScope, newData, newIndex) => {
      // ** Update the Object reference:
      // ** only if the Object has changed
      // ** AND only if _x is present already.
      if (currentScope.hasOwnProperty("_x") && currentScope._x !== newData) {
          currentScope._x = newData;
      }
      // ** Delete old values no longer on this new object;
      const currentScopeKeys = Object.keys(currentScope);
      for (let key of currentScopeKeys) {
          // ** Some properties are not changed once set.
          if (forScopePermantProperties.includes(key))
              continue;
          // ** We only want to try and delete properties that are on this object, not the prototype.
          if (!newData.hasOwnProperty(key)) {
              delete currentScope[key];
          }
      }
      if (typeof newData !== "string") {
          // ** Update or create values that weren't on Scope before.
          const newDataKeys = Object.keys(newData);
          for (let key of newDataKeys) {
              // ** This check is here not because we EXPECT these values to be on the new Object but because we DON'T EXPECT.
              // ** If they are here then they will break the Mint refresh causing untold misery to millions... and
              // ** as honest folk we can't possible allow that to happen!
              if (forScopePermantProperties.includes(key))
                  continue;
              currentScope[key] = newData[key];
          }
      }
      if (currentScope._i !== newIndex) {
          currentScope._i = newIndex;
      }
  };

  const moveElement = (element, index) => {
      const parentElement = element.parentElement;
      const before = Array.from(parentElement.children)[index];
      if (before === undefined) {
          parentElement.append(element);
      }
      else {
          parentElement.insertBefore(element, before);
      }
  };
  const matchElements = (currentRenders, oldList, newList, forKey) => {
      let stopped = false;
      for (let [i, x] of currentRenders.entries()) {
          if (stopped)
              return;
          if (x.element === undefined)
              return;
          let index = -1;
          for (let [i, y] of newList.entries()) {
              if (x.scope[forKey] === y[forKey]) {
                  index = i;
              }
          }
          if (index === undefined)
              return;
          if (i === index)
              return;
          if (index === -1) {
              console.warn(MINT_ERROR + "Unexpected mFor refresh error");
              return;
          }
          const [hold] = currentRenders.splice(i, 1);
          currentRenders.splice(index, 0, hold);
          stopped = true;
          const element = x.element;
          moveElement(element, index + 1);
          matchElements(currentRenders, oldList, newList, forKey);
      }
  };

  const handleErrorsAndWarnings = (blueprint, mFor) => {
      var _a, _b;
      const { nodeToClone, orderedProps, props, forListBlueprints, parentBlueprint, _rootScope, isSVG, } = blueprint;
      const { blueprintIndex } = getBlueprintIndex(blueprint);
      const childBlueprints = (_a = parentBlueprint === null || parentBlueprint === void 0 ? void 0 : parentBlueprint.childBlueprints) !== null && _a !== void 0 ? _a : _rootScope._rootChildBlueprints;
      const parentScope = (_b = parentBlueprint === null || parentBlueprint === void 0 ? void 0 : parentBlueprint.scope) !== null && _b !== void 0 ? _b : _rootScope;
      const { forKey } = mFor;
      /* Dev */
      // _DevLogger_("REFRESH", "mFor: ", mFor);
      const protoForData = resolvePropertyLookup(mFor.forValue, parentScope);
      // <@ REMOVE FOR PRODUCTION
      if (!(protoForData instanceof Array) && protoForData !== undefined) {
          throw new Error(`${MINT_ERROR} Must pass in an Array or undefined to mFor (mFor: "${mFor.forValue}")`);
      }
      // @>
      // ** Here we run a check against the mKey to check there are no duplicates.
      // ** We only want to include one for each key match and ignore duplicates.
      const checkUnique = checkUniqueService(forKey);
      const cloneProtoForData = [...protoForData];
      const forData = [];
      for (let [i, x] of cloneProtoForData.entries()) {
          if (checkUnique(x, i, cloneProtoForData)) {
              forData.push(x);
          }
      }
      // ** Duplicates won't cause errors but we warn the user because its isn't expected.
      if (protoForData.length !== forData.length) {
          console.warn(`mFor -- duplicate elements detected. Only one instance will be rendered. Check mKey value. ${forKey}`);
      }
      const parentElement = getParentElement(blueprint);
      return {
          forKey,
          forData,
          blueprintIndex,
          parentElement,
          nodeToClone,
          orderedProps,
          props,
          parentScope,
          forListBlueprints,
          childBlueprints,
          parentBlueprint,
          _rootScope,
          isSVG,
      };
  };
  const changeElementPosition = (forRender, requiredIndex, forRenders, allElements, options) => {
      const element = forRender.element;
      if (element === undefined)
          return;
      const { parentElement } = element;
      if (requiredIndex >= forRenders.length - 1) {
          addElement(element, options.parentElement, options.childBlueprints, options.blueprintIndex);
      }
      else {
          const targetElement = allElements[requiredIndex];
          parentElement === null || parentElement === void 0 ? void 0 : parentElement.insertBefore(element, targetElement);
      }
  };
  const rearrangeElements = (forRenders, options) => {
      const allElements = [];
      for (let x of [...options.parentElement.children]) {
          for (let y of forRenders) {
              if (y.element === x) {
                  allElements.push(x);
              }
          }
      }
      for (let [i, item] of forRenders.entries()) {
          const element = item.element;
          if (element === undefined) {
              continue;
          }
          const index = i;
          const locationIndex = allElements.indexOf(element);
          if (index !== locationIndex) {
              changeElementPosition(item, index, forRenders, allElements, options);
              rearrangeElements(forRenders, options);
              break;
          }
      }
  };
  const refreshMFor = (blueprint, { _mFor, newlyInserted }) => {
      var _a;
      const { forKey, forData, blueprintIndex, parentElement, nodeToClone, orderedProps, props, parentScope, parentBlueprint, forListBlueprints, childBlueprints, _rootScope, isSVG, } = handleErrorsAndWarnings(blueprint, _mFor);
      _mFor.forData = forData;
      const newList = forData;
      _mFor.oldForDataLength = newList.length;
      /* Dev */
      // _DevLogger_("REFRESH", "mFor: ", forData);
      // ** New list
      const newCurrentForRenders = [];
      // ** Find if each new item already exists on current list of childBlueprints.
      // ** If not then add the scope only. That way we can check which are already blueprinted
      // ** and blueprint the ones that aren't later.
      for (let [i, item] of newList.entries()) {
          let newCurrentRender = undefined;
          for (let x of forListBlueprints) {
              const { scope } = x;
              if (scope === undefined)
                  continue;
              if (forKey === "_i") {
                  if (i === scope["_i"]) {
                      newCurrentRender = x;
                      break;
                  }
                  continue;
              }
              if (forKey === "_x") {
                  if (item === scope["_x"]) {
                      newCurrentRender = x;
                      break;
                  }
                  continue;
              }
              if (item[forKey] === scope[forKey]) {
                  newCurrentRender = x;
              }
          }
          newCurrentForRenders.push(newCurrentRender || item);
          i++;
      }
      // ** Here we take the newly sorted renders and make sure they are all Blueprints
      // ** if not already.
      const forRenders = [];
      for (let [i, x] of newCurrentForRenders.entries()) {
          if (x instanceof Blueprint) {
              forRenders.push(x);
          }
          else {
              forRenders.push(generatemForBlueprint(nodeToClone, parentScope, orderedProps, props, nodeToClone.content, parentBlueprint, x, i, _rootScope, isSVG));
          }
      }
      _mFor.currentForRenders = forRenders;
      if (_mFor.mForType === FOR_Type.match) {
          const oldList = [..._mFor.currentForRenders];
          matchElements(_mFor.currentForRenders, oldList, newList, forKey);
          for (let [i, { scope }] of _mFor.currentForRenders.entries()) {
              recycleMForData(scope, newList[i], i);
          }
      }
      else if (_mFor.mForType === FOR_Type.default) {
          for (let [i, { scope }] of _mFor.currentForRenders.entries()) {
              recycleMForData(scope, newList[i], i);
          }
      }
      // ** Cycle through old list and if its not on the new list then remove this element.
      for (let currentRender of forListBlueprints) {
          if (!newCurrentForRenders.includes(currentRender) &&
              currentRender instanceof ElementBlueprint) {
              const element = currentRender.element;
              (_a = element === null || element === void 0 ? void 0 : element.parentElement) === null || _a === void 0 ? void 0 : _a.removeChild(element);
          }
      }
      for (let targetRender of forRenders) {
          if (!forListBlueprints.includes(targetRender)) {
              const element = targetRender.element;
              if (element !== undefined) {
                  addElement(element, parentElement, childBlueprints, blueprintIndex);
              }
          }
      }
      for (let targetRender of forRenders) {
          const { mintNode } = targetRender;
          if (mintNode === null)
              continue;
          if (!forListBlueprints.includes(targetRender)) {
              mintNode.render(targetRender, parentElement, childBlueprints, blueprintIndex);
          }
          else {
              const _refresh = mintNode.refresh;
              _refresh(targetRender, parentElement, {
                  newlyInserted,
              });
          }
      }
      // ** We need to make sure that things are kept in sync.
      // ** Here we tell the forListBlueprints about the new list of Blueprints, either added or removed.
      {
          forListBlueprints.length = 0;
          for (let x of forRenders) {
              forListBlueprints.push(x);
          }
      }
      rearrangeElements(forRenders, {
          childBlueprints,
          parentElement,
          blueprintIndex,
      });
      return {
          condition: true,
          value: blueprint,
      };
  };

  const createmForObject = ({ forKey, forValue, mForType, nodeToClone, _children, parentScope, orderedProps, props, parentBlueprint, _rootScope, isSVG, }) => {
      const initialForData = resolvePropertyLookup(forValue, parentScope);
      if (!(initialForData instanceof Array) || initialForData === undefined) {
          throw new Error(`${MINT_ERROR} Must pass in an Array or undefined to mFor (mFor: "${forValue}")`);
      }
      // ** Here we run a check against the mKey to check there are no duplicates.
      // ** We only want to include one for each key match and ignore duplicates.
      const checkUnique = checkUniqueService(forKey);
      const cloneForData = [...initialForData];
      const forData = [];
      for (let [i, x] of cloneForData.entries()) {
          if (checkUnique(x, i, cloneForData)) {
              forData.push(x);
          }
      }
      // ** Duplicates won't cause errors but we warn the user because its isn't expected.
      if (initialForData.length !== forData.length) {
          console.warn(`mFor -- duplicate elements detected. Only one instance will be rendered. Check mKey value. ${forKey}`);
      }
      const currentForRenders = [];
      for (let [i, x] of forData.entries()) {
          currentForRenders.push(generatemForBlueprint(nodeToClone, parentScope, orderedProps, props, _children, parentBlueprint, x, i, _rootScope, isSVG));
      }
      return {
          forKey,
          forValue,
          nodeToClone,
          scope: parentScope,
          forData,
          currentForRenders,
          oldForDataLength: forData.length,
          mForType,
      };
  };
  const generateMFor = ({ mForInstance, forValue, node, orderedProps, props, _children, parentScope, parentBlueprint, _rootScope, isSVG, }) => {
      var _a;
      const nodeToClone = node.mintNode;
      if (mForInstance.generated)
          return { condition: false };
      // <@ REMOVE FOR PRODUCTION
      {
          if (props.mKey === undefined) {
              console.error(nodeToClone);
              throw new Error(`${MINT_ERROR} mFor must have a mKey attribute`);
          }
      }
      // @>
      const forKey = props.mKey;
      // <@ REMOVE FOR PRODUCTION
      {
          if (forKey.includes(" ")) {
              console.warn(`${MINT_WARN} mKey value defined with a space, this may be a mistake. Value: "${forKey}".`);
          }
      }
      // @>
      // <@ REMOVE FOR PRODUCTION
      if (forValue.includes(" ")) {
          console.warn(`${MINT_WARN} mFor value defined with a space, this may be a mistake. Value: "${forValue}".`);
      }
      // @>
      mForInstance.generated = true;
      const mForType = (_a = props.mForType) !== null && _a !== void 0 ? _a : FOR_Type.default;
      // removeFromOrderedAttributes(orderedProps, props, [
      //   "mFor",
      //   "mKey",
      //   "mForType",
      // ]);
      mForInstance._mFor = createmForObject({
          forKey,
          forValue,
          mForType,
          nodeToClone: nodeToClone,
          _children,
          parentScope,
          orderedProps,
          props,
          parentBlueprint,
          _rootScope,
          isSVG,
      });
      const forListBlueprints = mForInstance._mFor.currentForRenders;
      const runRefresh = (blueprint, options) => {
          // refreshBlueprints(blueprint.forListBlueprints);
          refreshMFor(blueprint, Object.assign({ _mFor: mForInstance._mFor }, options));
      };
      mForInstance.blueprint = new ForBlueprint({
          render: mForInstance.onRender,
          // refresh: mForInstance.onRefresh,
          refresh: runRefresh,
          nodeToClone: nodeToClone,
          orderedProps,
          props,
          scope: parentScope,
          parentBlueprint,
          _rootScope,
          forListBlueprints,
          // collection: collection as Array<Blueprint>,
          isSVG: isSVG || undefined,
      });
      return {
          condition: true,
          value: mForInstance.blueprint,
      };
  };

  const renderFor = (blueprint, childBlueprints, parentElement, blueprintIndex) => {
      // <@ REMOVE FOR PRODUCTION
      if (blueprint === null ||
          blueprint.forListBlueprints === null ||
          blueprint.forListBlueprints === undefined) {
          throw new Error(`${MINT_ERROR} Render - For - Wrong Blueprint sent to mFor.`);
      }
      // @>
      const { forListBlueprints } = blueprint;
      for (let x of forListBlueprints) {
          renderBlueprints([x], parentElement, childBlueprints, [blueprintIndex]);
      }
      return {
          condition: true,
          value: blueprint,
      };
  };

  class MintFor extends MintAttribute {
      constructor(forValue) {
          super((oldInstance) => {
              const newInstance = new MintFor(forValue);
              newInstance._mFor = oldInstance._mFor;
              newInstance.generated = oldInstance.generated;
              newInstance.blueprint = oldInstance.blueprint;
              return newInstance;
          });
          this.generated = false;
          this.onGenerate = function (_a) {
              var args = __rest(_a, []);
              const that = this;
              return generateMFor(Object.assign({ mForInstance: that, forValue }, args));
          };
          this.onRender = function (blueprint, parentElement, parentChildBlueprints, blueprintIndex) {
              /* DEV */
              // _DevLogger_("RENDER", "FOR", blueprint, this);
              const that = this;
              if (that.blueprint !== blueprint) {
                  throw new Error("This is an unexpected error");
              }
              return renderFor(that.blueprint, parentChildBlueprints, parentElement, blueprintIndex);
          };
          this.onRefresh = function (_, __, options) {
              const that = this;
              refreshMFor(that.blueprint, Object.assign({ _mFor: that._mFor }, options));
              return { condition: false };
          };
      }
  }

  const mFor = (forValue) => {
      return { mFor: new MintFor(forValue) };
  };

  class UpwardRef {
      constructor(ref = null) {
          this.ref = ref;
      }
  }

  const generateMRef = ({ refValue, htmlElement, parentScope, scope, isAttribute }) => {
      const value = resolvePropertyLookup(refValue, parentScope);
      // ** Here we check if the ref is UpwardRef.
      // ** This is a pattern where we don't manipulate the parentScope directly.
      // ** This means we can pass the property down to children.
      if (value instanceof UpwardRef) {
          value.ref = htmlElement;
      }
      else {
          const _scope = isAttribute ? scope : parentScope;
          _scope[refValue] = htmlElement;
          if (!!_scope._store) {
              if (_scope._store.hasOwnProperty(refValue)) {
                  _scope._store[refValue] = htmlElement;
              }
              // <@ REMOVE FOR PRODUCTION
              else {
                  console.warn(`${MINT_WARN} tried to add property "${refValue}" using mRef to store "${_scope._store.constructor.name}" which does not have this property.`);
              }
              // @>
          }
      }
      return {
          condition: false,
          value: undefined,
      };
  };

  class MintRef extends MintAttribute {
      constructor(refValue) {
          super(() => new MintRef(refValue));
          this.onGenerate = (_a) => {
              var args = __rest(_a, []);
              return generateMRef(Object.assign({ refValue }, args));
          };
      }
  }

  const mRef = (refValue) => {
      return { mRef: new MintRef(refValue) };
  };

  const _get = (target, value) => {
      let output = target;
      const trail = value.split(".");
      while (trail.length > 0) {
          const [property] = trail;
          output = output[property];
          trail.shift();
      }
      return output;
  };
  class Resolver extends ScopeTransformer {
      constructor(callback) {
          super((scope, key) => {
              Object.defineProperty(scope, key, {
                  get: this.callback,
              });
          });
          if (callback instanceof Function) {
              this.callback = callback;
          }
          else {
              this.callback = function () {
                  return _get(this, callback);
              };
          }
      }
  }

  const quickElement = (name, attributesOrInitialContent, initialContent) => {
      let attributes = null;
      let content;
      // ** If initialContent is defined then we used all arguments.
      if (initialContent !== undefined) {
          attributes = attributesOrInitialContent;
          content = initialContent;
      }
      // ** If the attributesOrInitialContent is not an Object (not an Array) then this must be attributes only.
      else if (typeof attributesOrInitialContent !== "string" &&
          !(attributesOrInitialContent instanceof Array) &&
          !(attributesOrInitialContent instanceof CreateNode)) {
          attributes = attributesOrInitialContent;
      }
      // ** Otherwise we know that the second argument is the content and that
      // ** attributes should be null.
      else {
          attributes = null;
          content = attributesOrInitialContent;
      }
      return node(name, attributes, content);
  };

  const span = (attributesOrContent, _content) => {
      return quickElement("span", attributesOrContent, _content);
  };

  const div = (attributesOrContent, _content) => {
      return quickElement("div", attributesOrContent, _content);
  };

  class ButtonComponent extends MintScope {
      constructor() {
          super();
          this.type = "button";
          this.theme = "snow";
          this.class = "";
          this.style = undefined;
          this.content = undefined;
          this.id = undefined;
          this.classes = new Resolver(function () {
              if (this.hasExtraButtonLabel)
                  return `${this.class} multi-content`;
              return this.class;
          });
          this.hasIcon = new Resolver(function () {
              return this.icon !== undefined;
          });
          this.hasLabel = new Resolver(function () {
              return this.label !== undefined;
          });
          this.isSquare = new Resolver(function () {
              return this.square ? "square" : "";
          });
          this.isLarge = new Resolver(function () {
              return this.large ? "large" : "";
          });
          this.hasExtraButtonLabel = new Resolver(function () {
              return (this.extraButtonLabel !== null && this.extraButtonLabel !== undefined);
          });
          this.getExtraButtonLabel = function () {
              return this.extraButtonLabel;
          };
          this.getContent = function () {
              return this.content;
          };
          this.onClick = null;
      }
  }
  const Button = component("button", ButtonComponent, {
      "[type]": "type",
      class: "{theme} {classes} {isSquare} {isLarge}",
      "[style]": "style",
      "[title]": "title",
      "[id]": "id",
      "(click)": "onClick",
      mRef: mRef("ref"),
  }, [
      node("<>", Object.assign({}, mIf("!_children")), [
          node("<>", Object.assign({}, mIf("!content")), [
              node("span", { mIf: mIf("hasIcon"), class: "icon fa fa-{icon}" }),
              node("span", { mIf: mIf("hasLabel"), class: "label" }, "{label}"),
              node("span", { mIf: mIf("hasExtraButtonLabel"), class: "extra-content" }, node(template("getExtraButtonLabel"))),
          ]),
          node("<>", Object.assign({}, mIf("content")), node(template("getContent"))),
      ]),
      node("<>", Object.assign({}, mIf("_children")), "_children"),
  ]);

  class ColourSelectorComponent extends MintScope {
      constructor() {
          super();
          this.onInput = null;
          this.colourSelectorScope = this;
          this.showColours = false;
          this.colours = [
              "black",
              "green",
              "lightgreen",
              "blue",
              "lightblue",
              "grey",
              "lightgrey",
              "#444",
              "pink",
              "teal",
              "aqua",
              "red",
              "tomato",
              "purple",
          ];
          this.toggleShowColours = function () {
              this.colourSelectorScope.showColours =
                  !this.colourSelectorScope.showColours;
              externalRefresh(this.colourSelectorScope);
          };
          this.chooseColour = function () {
              var _a;
              (_a = this.onInput) === null || _a === void 0 ? void 0 : _a.call(this, this._x);
              this.colourSelectorScope.showColours = false;
              externalRefresh(this.colourSelectorScope);
          };
      }
  }
  const ColourSelector = component("div", ColourSelectorComponent, { class: "relative z-index" }, [
      node(Button, {
          "[large]": "large",
          square: true,
          content: node("span", null, "C"),
          "[colourSelectorScope]": "colourSelectorScope",
          "[onClick]": "toggleShowColours",
      }),
      node("ul", Object.assign(Object.assign({}, mIf("showColours")), { class: "list flex absolute left-gap", style: "top: 2rem; width: 100px;" }), node("li", Object.assign(Object.assign({}, mFor("colours")), { mKey: "_i", class: "width height snow-border pointer", style: "background-color: {_x};", "(click)": "chooseColour" }))),
  ]);

  class FieldInputComponent extends MintScope {
      constructor() {
          super();
          this.type = "text";
          this.style = "";
          this.onKeyDown = null;
          this.onInput = null;
          this.onFocus = null;
          this.onBlur = null;
          this._labelClass = new Resolver(function () {
              return this.labelClass + (this.large ? " large" : "");
          });
          this._inputClass = new Resolver(function () {
              return this.class + (this.large ? " large" : "");
          });
          this.isRequired = new Resolver(function () {
              return this.required ? "required" : "";
          });
          this.hasLabelAbove = new Resolver(function () {
              return !!this.label && !this.labelBeside;
          });
          this.hasLabelBeside = new Resolver(function () {
              return !!this.label && !!this.labelBeside;
          });
      }
  }
  const FieldInput = component("label", FieldInputComponent, { class: "{_labelClass} {isRequired}", "[style]": "labelStyles" }, [
      node("span", { mIf: mIf("hasLabelAbove") }, "{label}"),
      node("input", {
          "[type]": "type",
          "[name]": "name",
          "[value]": "value",
          "[checked]": "checked",
          "[class]": "_inputClass",
          "[style]": "style",
          "[placeholder]": "placeholder",
          "[required]": "required",
          "[readonly]": "readonly",
          "[id]": "id",
          "(keydown)": "onKeyDown",
          "(input)": "onInput",
          "(focus)": "onFocus",
          "(blur)": "onBlur",
          mRef: mRef("ref"),
      }),
      node("span", { mIf: mIf("hasLabelBeside") }, "{label}"),
  ]);

  const FieldCheckbox = component("div", null, null, node(FieldInput, {
      type: "checkbox",
      "[name]": "name",
      "[value]": "value",
      "[checked]": "checked",
      "[label]": "label",
      labelBeside: true,
      "[labelClass]": "labelClass",
      "[class]": "inputClass",
      "[large]": "large",
      "[style]": "style",
      "[required]": "required",
      "[readonly]": "readonly",
      "[id]": "id",
      "[onInput]": "onInput",
      "[ref]": "ref",
  }));

  const FieldRadio = component("div", null, null, node(FieldInput, {
      type: "radio",
      "[name]": "name",
      "[value]": "value",
      "[checked]": "checked",
      "[label]": "label",
      labelBeside: true,
      "[labelClass]": "labelClass",
      "[labelStyles]": "labelStyles",
      "[class]": "inputClass",
      "[style]": "style",
      "[required]": "required",
      "[readonly]": "readonly",
      "[onInput]": "onInput",
      "[ref]": "ref",
  }));

  class FieldSelectComponent extends MintScope {
      constructor() {
          super();
          this.style = "";
          this.options = [];
          this.onInput = null;
          this.hasLabel = new Resolver(function () {
              return !!this.label;
          });
      }
  }
  const FieldSelect = component("label", FieldSelectComponent, { class: "{labelClass} {isRequired}" }, [
      node("span", { mIf: mIf("hasLabel") }, "{label}"),
      node("select", {
          "[name]": "name",
          "[value]": "value",
          "[class]": "class",
          "[style]": "style",
          "[required]": "required",
          "[readonly]": "readonly",
          "[id]": "id",
          "(input)": "onInput",
          mRef: mRef("ref"),
      }, [
          node("option", {
              mFor: mFor("options"),
              mKey: "value",
              "[value]": "value",
          }, "{name}"),
      ]),
  ]);

  class FieldFieldsetComponent extends MintScope {
      constructor() {
          super();
          this.legend = "";
          this.value = null;
          this.options = [];
          this.isChecked = new Resolver(function () {
              return this.value === this.fieldValue;
          });
          this.fieldValue = new Resolver(() => this.value);
          this.onInput = null;
      }
  }
  const FieldFieldset = component("fieldset", FieldFieldsetComponent, { "[id]": "id" }, [
      node("legend", { mIf: mIf("legend"), class: "fieldset__legend" }, "{legend}"),
      node("ul", { class: "list flex" }, node("li", { mFor: mFor("options"), mKey: "value", class: "margin-right-small" }, node(FieldRadio, {
          "[name]": "name",
          "[value]": "value",
          "[label]": "label",
          "[class]": "class",
          "[labelClass]": "labelClass",
          "[labelStyles]": "labelStyles",
          "[style]": "style",
          "[checked]": "isChecked",
          "[onInput]": "onInput",
      }))),
  ]);

  class FieldTextareaComponent extends MintScope {
      constructor() {
          super();
          this.resize = false;
          this.style = "";
          this.onInput = null;
          this.hasLabel = new Resolver(function () {
              return !!this.label;
          });
          this.getStyles = new Resolver(function () {
              return (this.resize ? "" : "resize: none; ") + this.style;
          });
          this.getReadonly = new Resolver(function () {
              return this.readonly ? "true" : undefined;
          });
      }
  }
  const FieldTextarea = component("label", FieldTextareaComponent, { class: "{labelClass} {isRequired}" }, [
      node("span", { mIf: mIf("hasLabel") }, "{label}"),
      node("textarea", {
          "[name]": "name",
          "[value]": "value",
          "[class]": "class",
          "[placeholder]": "placeholder",
          "[style]": "getStyles",
          "[readonly]": "getReadonly",
          "[id]": "id",
          "(input)": "onInput",
          mRef: mRef("ref"),
      }),
  ]);

  const passProps = {
      "[type]": "type",
      "[name]": "name",
      "[value]": "value",
      "[checked]": "checked",
      "[label]": "label",
      "[legend]": "legend",
      "[labelBeside]": "labelBeside",
      "[labelClass]": "labelClass",
      "[labelStyles]": "labelStyles",
      "[class]": "class",
      "[style]": "style",
      "[large]": "large",
      "[required]": "required",
      "[readonly]": "readonly",
      "[id]": "id",
      "[onKeyDown]": "onKeyDown",
      "[onInput]": "onInput",
      "[onFocus]": "onFocus",
      "[onBlur]": "onBlur",
      "[ref]": "ref",
  };
  class FieldComponent extends MintScope {
      constructor() {
          super();
          this.type = "text";
          this.class = "";
          this.style = undefined;
          this.onKeyDown = null;
          this.onInput = null;
          this.onFocus = null;
          this.onBlur = null;
          this.extend = {};
          this.ref = null;
          this.isInput = new Resolver(function () {
              const inValidTypes = [
                  "textarea",
                  "select",
                  "checkbox",
                  "radio",
                  "fieldset",
              ];
              return !inValidTypes.includes(this.type);
          });
          this.isCheckbox = new Resolver(function () {
              return this.type === "checkbox";
          });
          this.isRadio = new Resolver(function () {
              return this.type === "radio";
          });
          this.isFieldSet = new Resolver(function () {
              return this.type === "fieldset";
          });
          this.isSelect = new Resolver(function () {
              return this.type === "select";
          });
          this.isTextarea = new Resolver(function () {
              return this.type === "textarea";
          });
      }
  }
  const Field = component("<>", FieldComponent, { "[class]": "wrapperClasses" }, [
      node(FieldInput, Object.assign({ mIf: mIf("isInput"), mExtend: mExtend("extend") }, passProps)),
      node(FieldCheckbox, Object.assign({ mIf: mIf("isCheckbox"), mExtend: mExtend("extend") }, passProps)),
      node(FieldRadio, Object.assign({ mIf: mIf("isRadio"), mExtend: mExtend("extend") }, passProps)),
      node(FieldFieldset, Object.assign(Object.assign({ mIf: mIf("isFieldSet"), mExtend: mExtend("extend") }, passProps), { "[options]": "options" })),
      node(FieldTextarea, Object.assign(Object.assign({ mIf: mIf("isTextarea"), mExtend: mExtend("extend") }, passProps), { "[resize]": "resize" })),
      node(FieldSelect, Object.assign(Object.assign({ mIf: mIf("isSelect"), mExtend: mExtend("extend") }, passProps), { "[options]": "options" })),
  ]);

  const modalTime = 500;

  const closeModal = (target, prop) => {
      target[prop] = "open closing";
      externalRefresh(target);
      setTimeout(() => {
          target[prop] = "";
          externalRefresh(target);
      }, modalTime);
  };

  class ModalComponent extends MintScope {
      constructor() {
          super();
          this.state = "";
          this.theme = "smoke";
          this.class = "";
          this.hasTitle = new Resolver(function () {
              return this.title !== undefined;
          });
          this.clickOnBackground = function () {
              if (this.closeOnBackgroundClick !== true)
                  return;
              if (this._store instanceof Store &&
                  typeof this.storeTarget === "string") {
                  closeModal(this._store, this.storeTarget);
              }
              else {
                  closeModal(this, "state");
              }
          };
      }
  }
  component("article", ModalComponent, { class: "modal {state}", "(click)": "clickOnBackground" }, node("div", { class: "modal__content {class}" }, [
      node("header", { mIf: mIf("hasTitle"), class: "modal__header {theme}" }, node("h2", null, "{title}")),
      "_children",
  ]));

  const exact = (target, hash) => {
      return target === hash;
  };
  const contains = (target, hash) => {
      return hash.includes(target);
  };
  const hasWord = (target, hash) => {
      return (hash.includes(` ${hash} `) ||
          exact(target, hash) ||
          starts(target + " ", hash) ||
          ends(" " + target, hash));
  };
  const containsAndHyphen = (target, hash) => {
      return target === hash || hash.includes(target + "-");
  };
  const starts = (target, hash) => {
      return hash.slice(0, target.length) === target;
  };
  const ends = (target, hash) => {
      return hash.slice(hash.length - target.length) === target;
  };

  var RouteType;
  (function (RouteType) {
      RouteType["exact"] = "exact";
      RouteType["="] = "=";
      RouteType["contains"] = "contains";
      RouteType["*"] = "*";
      RouteType["hasWord"] = "hasWord";
      RouteType["~"] = "~";
      RouteType["containsAndHyphen"] = "containsAndHyphen";
      RouteType["|"] = "|";
      RouteType["starts"] = "starts";
      RouteType["^"] = "^";
      RouteType["ends"] = "ends";
      RouteType["$"] = "$";
  })(RouteType || (RouteType = {}));

  const logic = {
      [RouteType.exact]: exact,
      [RouteType["="]]: exact,
      [RouteType.contains]: contains,
      [RouteType["*"]]: contains,
      [RouteType.hasWord]: hasWord,
      [RouteType["~"]]: hasWord,
      [RouteType.containsAndHyphen]: containsAndHyphen,
      [RouteType["|"]]: containsAndHyphen,
      [RouteType.starts]: starts,
      [RouteType["^"]]: starts,
      [RouteType.ends]: ends,
      [RouteType["$"]]: ends,
  };
  class RouterComponent extends MintScope {
      constructor() {
          super();
          this.routes = [];
          this.oninit = function () {
              var _a;
              (_a = this.onDefine) === null || _a === void 0 ? void 0 : _a.call(this, this);
          };
          this.router = function () {
              const routes = this.routes;
              const hash = window.location.hash.replace("#", "").replace(/%20/g, " ");
              {
                  let i = 0;
                  while (i < routes.length) {
                      const route = routes[i];
                      if (logic[route.type](route.target, hash))
                          return route.content;
                      i++;
                  }
              }
              return [];
          };
      }
  }
  component("<>", RouterComponent, {}, [
      node(template("router")),
  ]);

  class TabsComponent extends MintScope {
      constructor() {
          super();
          const scope = this;
          this.tabs = [];
          this.currentTab = null;
          this.currentTemplate = new Resolver(function () {
              return this.currentTab.template;
          });
          this.tabSelected = new Resolver(function () {
              return this.currentTab !== null;
          });
          this.activeTab = new Resolver(function () {
              return this._x === this.currentTab ? "active" : "";
          });
          this.onpreblueprint = function () {
              if (this.tabs.length === 0)
                  return;
              if (this.currentTab !== null)
                  return;
              this.currentTab = this.tabs[0];
          };
          this.selectTab = function () {
              var _a;
              scope.currentTab = this._x;
              (_a = scope.onSelectTab) === null || _a === void 0 ? void 0 : _a.call(scope);
              externalRefresh(scope);
          };
      }
  }
  component("div", TabsComponent, { class: "tabs", mRef: mRef("ref") }, [
      node("ul", { class: "tabs__list" }, node("li", {
          mFor: mFor("tabs"),
          mKey: "name",
          class: "tabs__list-item {activeTab}",
          "(click)": "selectTab",
      }, node("div", null, "{name}"))),
      node("div", { mIf: mIf("tabSelected"), class: "tabs__body" }, node(template({ onevery: true }, "currentTemplate"))),
  ]);

  class TableComponent extends MintScope {
      constructor() {
          super();
          this.columns = [];
          this.rows = [];
      }
  }
  component("table", TableComponent, { class: "table" }, [
      node("thead", null, node("tr", null, node("th", Object.assign(Object.assign({}, mFor("columns")), { mKey: "id" }), "{title}"))),
      node("tbody", null, node("tr", Object.assign(Object.assign({}, mFor("rows")), { mKey: "id" }), node("td", Object.assign(Object.assign({}, mFor("columns")), { mKey: "id" }), "{cell}"))),
  ]);

  const size = 8;
  const lineProps = (x1, x2) => ({
      x1,
      y1: size,
      x2,
      y2: 32 - size,
      stroke: "#fff",
      "stroke-width": "1.5px",
  });
  class AsideComponent extends MintScope {
      constructor() {
          super();
      }
  }
  const Aside = component("aside", AsideComponent, { class: "aside" }, [
      div({ class: "aside__title-container" }, [
          span({ class: "aside__title" }, "Cardamom"),
      ]),
      node(Button, {
          theme: "empty",
          label: "_",
          large: true,
          square: true,
          class: "snow-text",
      }),
      node(Button, { theme: "empty", label: "_", large: true, square: true }, node("svg", {
          class: "absolute middle width height",
          viewBox: "0 0 32 32",
      }, [
          node("line", lineProps(size, 32 - size)),
          node("line", lineProps(32 - size, size)),
      ])),
  ]);

  const resolveColours$1 = (colours) => {
      const output = [];
      if (colours === undefined)
          return output;
      const parts = colours.split(";");
      parts.forEach((colour, index) => {
          if (index === 0 || index === parts.length - 1)
              return;
          const _colour = `rgb(${colour
            .replace(/[a-z]/g, "")
            .replace(/(?!^)[\\]/g, ", ")
            .replace(/\\/g, "")})`;
          output.push(_colour);
      });
      return output;
  };
  const getColours = (colours) => {
      return colours
          .map((x) => {
          const [r, g, b] = x.replace("rgb(", "").replace(/[)\s]/g, "").split(",");
          return `\\red${r}\\green${g}\\blue${b}`;
      })
          .join(";");
  };
  const resolveSaveContent = (lines) => {
      const colours = [];
      const appContent = lines
          .map(({ content, styles }) => {
          if (styles["font-weight"] === "bold") {
              content = "\\b " + content + "\\b0";
          }
          if (styles["font-style"] === "italic") {
              content = "\\i " + content + "\\i0";
          }
          if (styles["text-decoration"] === "underline") {
              content = "\\ul " + content + "\\ulnone";
          }
          if (styles["color"] !== undefined) {
              const colour = styles["color"];
              const colourIndex = colours.findIndex((x) => x === colour);
              if (colourIndex !== -1) {
                  content = `\\cf${colourIndex + 1} ${content}\\cf0`;
              }
              else {
                  colours.push(colour);
                  const colourIndex = colours.length - 1;
                  content = `\\cf${colourIndex + 1} ${content}\\cf0`;
              }
          }
          return `${content}\\par`;
      })
          .join("\n");
      return {
          appContent,
          coloursLine: colours.length === 0
              ? undefined
              : `{\\colortbl ;${getColours(colours)};}`,
      };
  };

  class ListStore extends Store {
      constructor() {
          super({
              filePathName: null,
              contentFromFile: null,
              lines: [],
              currentIndex: null,
              lastCurrentIndex: null,
              colours: {},
              listElementRef: null,
              textareaContent: new Resolver(() => {
                  return listStore.lines.map((x) => x.content).join("\n");
              }),
              doNothing(event) {
                  event.preventDefault();
              },
          });
      }
  }
  const listStore = new ListStore();

  const resolveSaveColours = (coloursLine) => {
      const hasFileColoursIndex = listStore.contentFromFile.findIndex((x) => x.includes("\\colortbl"));
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

  const endOfFileContent = "\n" + "}\r" + "\n" + "\u0000";
  // const resolveFirstContentLine = (line: string, appContent: string) => {
  //   // ** Remove an unneeded line break that might be added.
  //   if (line.substring(line.length - 5) === "\\par\r") {
  //     line = line.substring(0, line.length - 5);
  //   }
  //   // ** If there is no appContent then we don't need to add a space in.
  //   line = appContent === "" ? line + "\n" : line + " " + appContent + "\n";
  //   {
  //     const lineStart = line.includes("{")
  //       ? line.substring(0, line.lastIndexOf("}") + 1)
  //       : "";
  //     let lineEnd = line.includes("{")
  //       ? line.substring(line.lastIndexOf("}") + 1, line.length)
  //       : line;
  //     let lineHeightSet = [false, false];
  //     let fontSizeSet = false;
  //     lineEnd = lineEnd
  //       .split("\\")
  //       .map((x) => {
  //         if (line.charAt(0) !== "\\" || x.includes(" ")) return x;
  //         if (x.substring(0, 2) === "sl" && x.length === 5) {
  //           lineHeightSet[0] = true;
  //           return "sl240";
  //         }
  //         if (x.substring(0, 7) === "slmulti") {
  //           lineHeightSet[1] = true;
  //           return x;
  //         }
  //         if (x.substring(0, 2) === "fs") {
  //           fontSizeSet = true;
  //           return "fs22";
  //         }
  //         return x;
  //       })
  //       .join("\\");
  //     if (!lineHeightSet[1]) {
  //       lineEnd = "\\slmulti" + lineEnd;
  //     }
  //     if (!lineHeightSet[0]) {
  //       lineEnd = "\\sl240" + lineEnd;
  //     }
  //     if (!fontSizeSet) {
  //       lineEnd = "\\fs22" + lineEnd;
  //     }
  //     line = lineStart + lineEnd;
  //   }
  //   return line;
  // };
  const saveToFile = () => {
      const { appContent, coloursLine } = resolveSaveContent(listStore.lines);
      resolveSaveColours(coloursLine);
      // const contentLinesBeforeContent = listStore.contentFromFile
      //   .slice(0, -1)
      //   .join("\n");
      const _contentLinesBeforeContent = [
          "{\\rtf1\\ansi\\ansicpg1252\\deff0\\nouicompat\\deflang1033{\\fonttbl{\\f0\\fnil\\fcharset0 Calibri;}}",
          "{\\*\\generator Riched20 10.0.19041}\\viewkind4\\uc1 ",
          "\\pard\\sl240\\slmult1\\f0\\fs22\\lang9\\par",
      ];
      if (coloursLine !== undefined) {
          _contentLinesBeforeContent.splice(1, 0, coloursLine);
      }
      const contentLinesBeforeContent = _contentLinesBeforeContent.join("\n");
      // const firstLineWithContent = resolveFirstContentLine(
      //   listStore.contentFromFile.at(-1),
      //   appContent
      // );
      // const content =
      //   contentLinesBeforeContent + firstLineWithContent + endOfFileContent;
      const content = contentLinesBeforeContent + " " + appContent + endOfFileContent;
      // console.log(content);
      const saveToFile = new CustomEvent("saveToFile", {
          detail: { content, filePathName: listStore.filePathName },
      });
      window.dispatchEvent(saveToFile);
  };

  /******************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */

  function __awaiter$1(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  }

  typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
  };

  const wait = (time = 0) => new Promise((resolve) => {
      setTimeout(() => {
          resolve();
      }, time);
  });

  /******************************************************************************
  Copyright (c) Microsoft Corporation.

  Permission to use, copy, modify, and/or distribute this software for any
  purpose with or without fee is hereby granted.

  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
  PERFORMANCE OF THIS SOFTWARE.
  ***************************************************************************** */

  function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  }

  typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
  };

  const time = 300;
  const timeToWait = 3000;

  class Toaster {
      constructor(target = document.body) {
          this.toast = (message, options, alternateElementTarget) => __awaiter(this, void 0, void 0, function* () {
              var _a;
              const _previousTarget = this.target;
              if (alternateElementTarget !== undefined) {
                  this.target = alternateElementTarget;
              }
              const theme = typeof options === "string" ? options : (_a = options === null || options === void 0 ? void 0 : options.theme) !== null && _a !== void 0 ? _a : "blueberry";
              const { hasButton, clickToClose, linger, classes, buttonClasses } = typeof options === "string" ? {} : options;
              if (this.toasts.length === 0) {
                  this.mountToastContainer();
              }
              this.target = _previousTarget;
              const toast = { element: document.createElement("div") };
              toast.element.classList.add("toast", `toast__${theme}`, ...(classes || []));
              const toastMessageSpan = document.createElement("span");
              toastMessageSpan.textContent = message;
              const toastMessageButton = document.createElement("button");
              toastMessageButton.classList.add("toast__button", "empty", ...(buttonClasses || []));
              {
                  const buttonSpan = document.createElement("span");
                  buttonSpan.classList.add("fa", "fa-times");
                  toastMessageButton.append(buttonSpan);
              }
              const remove = () => __awaiter(this, void 0, void 0, function* () {
                  var _b, _c;
                  delete toast.remove;
                  if (clickToClose === true) {
                      toast.element.removeEventListener("click", remove);
                  }
                  toastMessageButton.removeEventListener("click", remove);
                  toast.element.classList.add("fade-out");
                  yield wait(time);
                  (_b = toast.element.parentElement) === null || _b === void 0 ? void 0 : _b.removeChild(toast.element);
                  this.toasts.splice(this.toasts.indexOf(toast, 1));
                  if (this.toasts.length == 0) {
                      this.index = 0;
                      (_c = this.toastContainer.parentElement) === null || _c === void 0 ? void 0 : _c.removeChild(this.toastContainer);
                  }
              });
              toast.remove = remove;
              if (clickToClose === true) {
                  toast.element.addEventListener("click", remove);
              }
              toastMessageButton.addEventListener("click", remove);
              toast.element.append(toastMessageSpan);
              if (hasButton === undefined) {
                  toast.element.append(toastMessageButton);
              }
              this.toastContainer.append(toast.element);
              this.toasts.push(toast);
              this.index++;
              const _timeToWait = typeof linger !== "number"
                  ? timeToWait
                  : (() => {
                      // ** TS should accept a number as an argument here but....... you know!
                      if (linger < 0 || parseInt(linger + "") !== linger) {
                          console.error("Must provide a positive integer for the property 'linger'.");
                          return timeToWait;
                      }
                      return linger;
                  })();
              yield wait(_timeToWait);
              remove();
          });
          this.index = 0;
          this.toasts = [];
          this.target = target;
          {
              const toastContainer = document.createElement("div");
              toastContainer.classList.add("toast-container");
              this.toastContainer = toastContainer;
          }
      }
      getToastIndex(index) {
          return `toast--piece--${index}`;
      }
      mountToastContainer() {
          this.target.append(this.toastContainer);
      }
  }
  new Toaster(document.body);

  const resolveLeadingZeroes = (item) => {
      if (typeof item === "number") {
          if (item < 10)
              return "0" + item;
          return "" + item;
      }
      else {
          if (item.length === 1)
              return "0" + item;
          return item;
      }
  };
  const dateMap = new Map();
  dateMap.set("dd/mm/yyyy", ({ d, m, y }) => `${resolveLeadingZeroes(d)}/${resolveLeadingZeroes(m)}/${y}`);
  dateMap.set("dd/mm/yyyy hh:mm", ({ d, m, y, h, min }) => `${resolveLeadingZeroes(d)}/${resolveLeadingZeroes(m)}/${y} ${resolveLeadingZeroes(h)}:${resolveLeadingZeroes(min)}`);
  dateMap.set("yyyy-mm-dd", ({ d, m, y }) => `${y}-${resolveLeadingZeroes(m)}-${resolveLeadingZeroes(d)}`);
  dateMap.set("dd-mm-yyyy", ({ d, m, y }) => `${resolveLeadingZeroes(d)}-${resolveLeadingZeroes(m)}-${y}`);
  dateMap.set("dd-mm-yyyy hh:mm", ({ d, m, y, h, min }) => `${resolveLeadingZeroes(d)}-${resolveLeadingZeroes(m)}-${y} ${resolveLeadingZeroes(h)}:${resolveLeadingZeroes(min)}`);

  const styles = (obj) => {
      return Object.entries(obj)
          .filter(([key, value]) => key !== undefined && value !== undefined)
          .map(([key, value]) => `${key}: ${value}`)
          .join("; ");
  };

  const keysHeld = {
      Control: false,
  };

  const addKeyEvents = () => {
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

  const resolveBold = (states, content, styles) => {
      if (states.isBold || content.includes("\\b")) {
          states.isBold = true;
          styles["font-weight"] = "bold";
      }
      if (content.includes("\\b0")) {
          states.isBold = false;
          content = content.replace(/\\b0/g, "");
      }
      content = content.replace(/\\b\s/g, "").replace(/\\b/g, "");
      return content;
  };

  const resolveItalics = (states, content, styles) => {
      if (states.isItalic || content.includes("\\i")) {
          states.isItalic = true;
          styles["font-style"] = "italic";
      }
      if (content.includes("\\i0")) {
          states.isItalic = false;
          content = content.replace(/\\i0/g, "");
      }
      content = content.replace(/\\i\s/g, "").replace(/\\i/g, "");
      return content;
  };

  const resolveUnderline = (states, content, styles) => {
      if (states.isUnderline || content.includes("\\ul")) {
          states.isUnderline = true;
          styles["text-decoration"] = "underline";
      }
      if (content.includes("\\ulnone")) {
          states.isUnderline = false;
          content = content.replace(/\\ulnone/g, "");
      }
      content = content.replace(/\\ul\s/g, "").replace(/\\ul/g, "");
      return content;
  };

  const resolveColours = (states, content, styles) => {
      {
          let index = 1;
          // ** Font colour
          for (let colour of listStore.colours) {
              if (content.includes(`\\cf${index}`)) {
                  states.setColour = colour;
              }
              if (states.setColour !== null) {
                  styles.color = states.setColour;
              }
              index++;
          }
      }
      if (content.includes("\\cf0")) {
          states.setColour = null;
          content = content.replace(`\\cf0`, "");
      }
      {
          for (let index of listStore.colours.map((_, i) => i + 1)) {
              content = content.replace(`\\cf${index} `, "");
          }
      }
      return content;
  };

  const resolveLink = (content) => {
      content = content.replace(/ HYPERLINK "[a-zA-Z0-9()@:%_\-\+.~#?&=\\\/]+"/g, "");
      return content;
  };

  const resolveOther = (content) => {
      const firstIsContent = content.charAt(0) !== "\\";
      {
          const first = content.charAt(0);
          const last = content.charAt(content.length - 1);
          if (first === `"` && last === `"`) {
              content = content.substring(1, content.length - 1);
          }
      }
      content = content
          .split("\\")
          .reduce((a, b, i) => {
          if (firstIsContent && i === 0) {
              a.push(b);
              return a;
          }
          let tag = b;
          let _content = "";
          if (b.includes(" ")) {
              tag = b.substring(0, b.indexOf(" "));
              _content = b.substring(b.indexOf(" ") + 1, b.length);
          }
          if (tag === "tab") {
              a.push("    ");
          }
          a.push(_content);
          return a;
      }, [])
          .join("");
      return content;
  };

  const lineId = { index: 0 };

  class Line {
      constructor({ content = "", styles: styles$1 = {}, id, } = {
          content: "",
      }) {
          this.content = content;
          this.styles = styles$1;
          if (id !== undefined) {
              this.id = id;
          }
          else {
              this.id = ++lineId.index;
          }
          this.getStyles = () => {
              return styles(Object.assign({}, this.styles));
          };
      }
  }

  const resovleLoadContent = (lines) => {
      const output = [];
      const states = {
          isBold: false,
          isItalic: false,
          isUnderline: false,
          setColour: null,
          // reset() {
          //   this.isBold = false;
          //   this.isItalic = false;
          //   this.isUnderline = false;
          //   this.setColour = null;
          // },
      };
      for (let line of lines) {
          let styles = {};
          let content = line;
          // ** Paragraph
          content = content.replace(/\\pard/g, "");
          content = content.replace(/\\par/g, "");
          // ** Line break
          content = content.replace(/\r/g, " ");
          // ** Links
          content = resolveLink(content);
          // ** Bold
          content = resolveBold(states, content, styles);
          // ** Italic
          content = resolveItalics(states, content, styles);
          // ** Underline
          content = resolveUnderline(states, content, styles);
          // ** Colours
          content = resolveColours(states, content, styles);
          // ** Other things resolved, like tab indents
          content = resolveOther(content);
          // ** Remove content that is just one space (an output from one of the above).
          if (content === " ") {
              content = "";
          }
          // ** There is no point defining styles on content that is missing.
          if (content === "") {
              styles = {};
          }
          output.push(new Line({
              content,
              styles,
          }));
      }
      return output;
  };

  /*
  const getContent = (contentLines: Array<string>) => {
    // ** The first line of content will be the first line to have "\par in".
    // const firstContentLineIndex = contentLines.findIndex((x) =>
    //   x.includes("\\par")
    // );
    // ** This means the lines from the start until here are non content lines.
    // const contentLinesBeforeContent = contentLines.slice(
    //   0,
    //   firstContentLineIndex
    // );

    const firstContentLine = contentLines.find((x) => x.includes("\\par"));
    const contentIndex = contentLines.indexOf(firstContentLine);
    const linesBeforeContent = contentLines.slice(0, contentIndex);

    // const firstLineWithContent = contentLines[firstContentLineIndex];
    let preContent = "";
    // let openingContent = "";
    let firstContent = "";

    const index = firstContentLine.includes("{")
      ? firstContentLine.lastIndexOf("}") + 1
      : 0;
    const { length } = firstContentLine;
    preContent += firstContentLine.substring(0, index);
    firstContent = firstContentLine.substring(index, length);

    {
      const [firstMatch] = [...firstContent.matchAll(/\s[^\\]/g)];
      if (firstMatch === undefined) {
        firstContent = "";
      } else {
        const { index } = firstMatch;
        const { length } = firstContent;
        preContent += firstContent.substring(0, index);
        firstContent = firstContent.substring(index + 1, length);
      }
    }

    // if (firstLineWithContentNonContent.charAt(0) === "{") {
    //   const index = firstLineWithContentNonContent.indexOf("}") + 1;
    //   openingContent = firstLineWithContentNonContent.substring(0, index);
    //   firstLineWithContentNonContent = firstLineWithContentNonContent.substring(
    //     index,
    //     firstLineWithContentNonContent.length
    //   );
    // }
    // if (firstLineWithContentNonContent.includes(" ")) {
    //   const index = firstLineWithContentNonContent.indexOf(" ");
    //   firstContent = firstLineWithContentNonContent.substring(
    //     index + 1,
    //     firstLineWithContentNonContent.length
    //   );
    //   firstLineWithContentNonContent = firstLineWithContentNonContent.substring(
    //     0,
    //     index
    //   );
    // }
    // firstLineWithContentNonContent =
    //   openingContent + firstLineWithContentNonContent;

    // console.log("Contente: ", preContent, "|", firstContent);

    return {
      linesBeforeContent,
      firstContentLine,
      contentIndex,
      // firstContentLineIndex,
      // contentLinesBeforeContent,
      // firstLineWithContentNonContent,
      preContent,
      firstContent,
    };
  };
  */
  const loadFile = (content, filePathName) => {
      // ** Set the file name on the store so we have it for later (when saving or editing).
      listStore.filePathName = filePathName;
      /*
      // console.log(content);
    
      // content = content.replace(/{[^{}]*}/g, (x) => x.replace(/\n/g, " "));
    
      // const mats = [...content.matchAll(/{[^{}]*}/g)];
      // console.log("MAts: ", mats);
    
      // ** Parsed the rich text file
      const contentLines = content.split("\n");
    
      const {
        // firstContentLine,
        linesBeforeContent,
        contentIndex,
        // firstContentLineIndex,
        // contentLinesBeforeContent,
        // firstLineWithContentNonContent,
        // firstLineOfContent,
        preContent,
        firstContent,
      } = getContent(contentLines);
    
      let completeContent = [
        firstContent,
        ...contentLines.slice(contentIndex),
      ].join("\n");
      // console.log(contentLines.slice(contentIndex));
    
      completeContent = completeContent.replace(/{[^{}]*}/g, (x) => {
        // x.replace(/\n/g, " ")
        const str = x.substring(1, x.length - 1);
        console.log("Each: ", str);
        return str;
      });
      // console.log(completeContent);
    
      const contentLines2 = completeContent.split("\n");
    
    
    
      // ** Here we resolve certain aspects of the styling of the file
      // ** such as font size and line height.
      const managedPreContent = resolvefirstContent(preContent);
      // ** Save the content for later; when we put it back together to save the file.
      listStore.contentFromFile = [...linesBeforeContent, managedPreContent];
    
      const lines: Array<string> = [];
    
      // ** Check if the content is empty.
      lines.push(firstContent);
      // if (firstContent !== "") {
      //   lines.push(firstContent.substring(firstContent.indexOf(" ") + 1));
      // }
      // // ** We need to have at least one line, even if its an empty string.
      // else {
      //   lines.push("");
      // }
    
      {
        // ** Extract the content lines.
        let i = contentIndex + 1;
        while (i < contentLines2.length - 2) {
          const line = contentLines2[i];
          lines.push(line);
          i++;
        }
      }
        */
      // content = content
      //   .substring(content.indexOf("\\par"), content.length - 1)
      //   .replace(/{[^{}]*}/g, (x) => {
      //     x = x.replace(/\n/g, " ");
      //     const str = x.substring(1, x.length - 1);
      //     // console.log("Each: ", str);
      //     return str;
      //   });
      listStore.contentFromFile = content
          .substring(0, content.indexOf("\\par"))
          .split("\n");
      let resolvedContent = "";
      {
          const mainContent = content
              .substring(content.indexOf("\\par"), content.length - 1)
              .split("");
          // let targetContent = null;
          // let braceDepths = [];
          for (let [index, char] of mainContent.entries()) {
              // if (char === "{") {
              //   braceDepths.push(index);
              // } else if (char === "}") {
              //   targetContent = mainContent.substring(braceDepths.pop(), index + 1);
              // } else if (braceDepths.length === 0) {
              //   resolvedContent += char;
              // }
              // if (targetContent !== null) {
              //   console.log("Each: ", targetContent);
              //   targetContent = targetContent.replace(/\n/g, " ");
              //   const str = targetContent.substring(1, targetContent.length - 1);
              //   console.log("Str: ", str);
              //   resolvedContent += str;
              //   targetContent = null;
              // }
              if ((char === "{" || char === "}") && mainContent[index - 1] !== "\\") {
                  continue;
              }
              resolvedContent += char;
          }
      }
      // console.log(resolvedContent);
      const contentLines = resolvedContent.split("\n");
      // ** Set the colours for this file.
      const colourLine = contentLines.find((x) => x.includes("\\colortbl"));
      listStore.colours = resolveColours$1(colourLine);
      const lines = contentLines;
      // console.log("Lines: ", lines);
      listStore.lines = resovleLoadContent(lines);
      externalRefresh(appStore);
  };

  const addLoadFileEvent = () => {
      window.addEventListener("fileLoaded", (event) => {
          const { detail: { content, filePathName }, } = event;
          loadFile(content, filePathName);
      });
  };

  class AppStore extends Store {
      constructor() {
          super({
              isTextarea: false,
              isTextareaOverflow: new Resolver(() => appStore.isTextarea ? "hidden" : "auto"),
              oninit: () => __awaiter$1(this, void 0, void 0, function* () {
                  addKeyEvents();
                  addLoadFileEvent();
                  yield wait();
                  externalRefresh(listStore);
              }),
          });
      }
  }
  const appStore = new AppStore();

  class ControlsStore extends Store {
      constructor() {
          super({
              hasFileLoaded: new Resolver(() => listStore.filePathName !== null),
              fileName: new Resolver(() => listStore.filePathName.split("\\").pop().split(".").shift()),
              fileLocation: new Resolver(() => listStore.filePathName.split("\\").slice(0, -1).join("\\")),
              isTextareaTheme: new Resolver(() => appStore.isTextarea ? "blueberry" : "snow"),
              doNothing: (event) => event.preventDefault(),
              updateFileName: (_, element) => {
                  const filePath = listStore.filePathName
                      .split("\\")
                      .slice(0, -1)
                      .join("\\");
                  const newValue = filePath + "\\" + element.value + ".rtf";
                  listStore.filePathName = newValue;
              },
              openFile: () => {
                  window.dispatchEvent(new Event("loadFromFile"));
              },
              saveToFile: () => {
                  saveToFile();
              },
              toggleTextarea() {
                  appStore.isTextarea = !appStore.isTextarea;
                  externalRefresh(appStore);
              },
          });
      }
  }
  const controlsStore = new ControlsStore();

  class ControlsComponent extends MintScope {
      constructor() {
          super();
          controlsStore.connect(this);
      }
  }
  const Controls = component("section", ControlsComponent, { class: "main__controls-section" }, [
      node("form", {
          class: "main__controls-form",
          "(submit)": "doNothing",
      }, node("<>", Object.assign({}, mIf("hasFileLoaded")), [
          node(Field, {
              "[value]": "fileName",
              "[onInput]": "updateFileName",
          }),
          node("span", { class: "main__controls-location" }, "{fileLocation}"),
      ])),
      div([
          node(Button, {
              icon: "download",
              class: "margin-right-small",
              square: true,
              "[onClick]": "openFile",
          }),
          node(Button, {
              theme: "blueberry",
              icon: "floppy-o",
              class: "margin-right-small",
              square: true,
              "[onClick]": "saveToFile",
          }),
          node(Button, {
              "[theme]": "isTextareaTheme",
              icon: "file-text-o",
              class: "margin-right-small",
              square: true,
              "[onClick]": "toggleTextarea",
          }),
      ]),
  ]);

  const changeStyle = (style, value, toggle = false) => {
      const { lastCurrentIndex, lines, listElementRef } = listStore;
      if (lastCurrentIndex === null)
          return;
      const { styles } = lines[lastCurrentIndex];
      if (toggle) {
          if (!!styles[style]) {
              delete styles[style];
          }
          else {
              styles[style] = value;
          }
      }
      else {
          styles[style] = value;
      }
      externalRefresh(listStore);
      listElementRef.children[lastCurrentIndex].querySelector("input").focus();
  };

  const toggleBold = () => {
      changeStyle("font-weight", "bold", true);
  };
  const toggleItalic = () => {
      changeStyle("font-style", "italic", true);
  };
  const toggleUnderline = () => {
      changeStyle("text-decoration", "underline", true);
  };

  class Option {
      constructor(args) {
          const { theme, icon, label, title, content, action } = args;
          if (theme) {
              this.theme = theme;
          }
          if (icon) {
              this.icon = icon;
          }
          if (label) {
              this.label = label;
          }
          if (args.class) {
              this.class = `${args.class} margin-right-small`;
          }
          else {
              this.class = "margin-right-small margin-bottom-small";
          }
          this.title = title;
          if (content) {
              this.content = content;
          }
          this.action = action;
      }
  }

  const options = [
      new Option({
          theme: undefined,
          label: "B",
          class: "bold",
          title: "Make bold",
          action: toggleBold,
      }),
      new Option({
          theme: undefined,
          label: "I",
          class: "italic",
          title: "Make italic",
          action: toggleItalic,
      }),
      new Option({
          theme: undefined,
          label: "U",
          class: "underline",
          title: "Make underline",
          action: toggleUnderline,
      }),
      // new Option({ icon: "level-up", title: "Increase font size", action: fontUp }),
      // new Option({
      //   icon: "level-down",
      //   title: "Decrease font size",
      //   action: fontDown,
      // }),
  ];

  const chooseColour = (colour) => {
      changeStyle("color", colour);
  };
  class OptionsStore extends Store {
      constructor() {
          super({
              isBoldy: true,
              options,
              chooseColour,
              optionsElementRef: null,
          });
      }
  }
  const optionsStore = new OptionsStore();

  class TogglesStore extends Store {
      constructor() {
          super({});
      }
  }
  const togglesStore = new TogglesStore();

  class TogglesComponent extends MintScope {
      constructor() {
          super();
          togglesStore.connect(this);
      }
  }
  const Toggles = component("<>", TogglesComponent, null, node(Button, Object.assign(Object.assign({}, mFor("options")), { mKey: "_i", "[theme]": "theme", square: true, "[content]": "content", "[onClick]": "action" })));
  class OptionsComponent extends MintScope {
      constructor() {
          super();
          optionsStore.connect(this);
      }
  }
  const Options = component("section", OptionsComponent, Object.assign(Object.assign({}, mRef("optionsElementRef")), { class: "margin-bottom-small" }), node("ul", { class: "list flex" }, [
      node(Toggles, { "[options]": "options" }),
      node(ColourSelector, { "[onInput]": "chooseColour" }),
  ]));

  const addLine = function () {
      listStore.lines.splice(this.index + 1, 0, new Line());
      externalRefresh(listStore);
  };

  const deleteLine = function () {
      if (listStore.lines.length === 1)
          return;
      listStore.lines.splice(this.index, 1);
      externalRefresh(listStore);
  };

  const inputKeyDown = function (event) {
      const { key } = event;
      if (key === "Backspace" && listStore.currentIndex !== null) {
          const { lines, currentIndex } = listStore;
          const line = listStore.lines[listStore.currentIndex];
          const { content } = line;
          // ** Only if there is no content.
          if (content === "") {
              // ** We want at least one line left.
              if (lines.length !== 1) {
                  lines.splice(currentIndex, 1);
                  // Update index to the previous item, only if we're not at the first already.
                  if (currentIndex !== 0) {
                      listStore.currentIndex = currentIndex - 1;
                      const element = listStore.listElementRef.children[listStore.currentIndex];
                      const inputElement = element.querySelector("input");
                      inputElement.focus();
                  }
                  externalRefresh(listStore);
                  event.preventDefault();
              }
          }
      }
      if (key === "Enter") {
          addLine.apply(this);
          const element = listStore.listElementRef.children[this.index + 1];
          const inputElement = element.querySelector("input");
          inputElement.focus();
      }
      if (key === "Delete" && keysHeld.Control) {
          deleteLine.apply(this);
          const element = listStore.listElementRef.children[this.index];
          if (!!element) {
              const inputElement = element.querySelector("input");
              inputElement.focus();
          }
      }
      if (key === "ArrowUp") {
          if (this.index !== 0) {
              const element = listStore.listElementRef.children[this.index - 1];
              const inputElement = element.querySelector("input");
              inputElement.focus();
          }
      }
      if (key === "ArrowDown") {
          if (this.index !== listStore.lines.length - 1) {
              const element = listStore.listElementRef.children[this.index + 1];
              const inputElement = element.querySelector("input");
              inputElement.focus();
          }
      }
      if (key === "b" && keysHeld.Control) {
          toggleBold();
      }
      if (key === "i" && keysHeld.Control) {
          toggleItalic();
      }
      if (key === "u" && keysHeld.Control) {
          event.preventDefault();
          toggleUnderline();
      }
  };

  const inputChange = function (_, element) {
      listStore.lines[this.index].content = element.value;
  };
  const inputFocus = function () {
      listStore.currentIndex = this.index;
      listStore.lastCurrentIndex = this.index;
      if (listStore.lines[this.index].styles["font-weight"] === "bold") {
          options[0].theme = "blueberry";
      }
      else {
          options[0].theme = undefined;
      }
      if (listStore.lines[this.index].styles["font-style"] === "italic") {
          options[1].theme = "blueberry";
      }
      else {
          options[1].theme = undefined;
      }
      if (listStore.lines[this.index].styles["text-decoration"] === "underline") {
          options[2].theme = "blueberry";
      }
      else {
          options[2].theme = undefined;
      }
      externalRefresh(optionsStore);
  };
  const inputBlur = () => {
      listStore.currentIndex = null;
      options[0].theme = undefined;
      options[1].theme = undefined;
      options[2].theme = undefined;
      externalRefresh(togglesStore);
  };
  class ListItemComponent extends MintScope {
      constructor() {
          super();
          this.buttons = [
              { theme: "snow", icon: "level-down", class: "add", action: addLine },
              { theme: "tomato", icon: "trash-o", class: "delete", action: deleteLine },
          ];
          this.inputKeyDown = inputKeyDown;
          this.inputChange = inputChange;
          this.inputFocus = inputFocus;
          this.inputBlur = inputBlur;
          this.addLine = addLine;
          this.deleteLine = deleteLine;
      }
  }
  const ListItem = component("div", ListItemComponent, {}, [
      node(Field, {
          "[value]": "content",
          "[style]": "style",
          "[onKeyDown]": "inputKeyDown",
          "[onInput]": "inputChange",
          "[onFocus]": "inputFocus",
          "[onBlur]": "inputBlur",
          "[index]": "index",
          extend: {
              "[index]": "index",
          },
      }),
      // div(
      //   {
      //     ...mFor("buttons"),
      //     mKey: "_i",
      //     class: "list-item__button list-item__button--{class}",
      //   },
      //   node(Button, {
      //     "[theme]": "theme",
      //     "[icon]": "icon",
      //     "[label]": "label",
      //     square: true,
      //     "[onClick]": "action",
      //     "[index]": "index",
      //   })
      // ),
  ]);

  class ListComponent extends MintScope {
      constructor() {
          super();
          listStore.connect(this);
      }
  }
  const List = component("div", ListComponent, {}, [
      node("form", { "(submit)": "doNothing" }, [
          node("ul", Object.assign(Object.assign(Object.assign({}, mIf("!isTextarea")), { class: "list" }), mRef("listElementRef")), node("li", Object.assign(Object.assign({}, mFor("lines")), { mKey: "id", class: "list-item" }), [
              node(ListItem, {
                  "[content]": "content",
                  "[style]": "getStyles",
                  "[index]": "_i",
              }),
          ])),
          node(Field, Object.assign(Object.assign({}, mIf("isTextarea")), { type: "textarea", "[value]": "textareaContent", labelClass: "list-item", style: "height: 100%;" })),
      ]),
  ]);

  class AppComponent extends MintScope {
      constructor() {
          super();
          appStore.connect(this);
      }
  }
  const App = component("<>", AppComponent, {}, [
      node(Aside),
      node("main", null, [
          div({ class: "main__controls" }, [node(Controls), node(Options)]),
          div({ class: "main__list", style: "overflow-y: {isTextareaOverflow}" }, node(List, { "[isTextarea]": "isTextarea" })),
      ]),
  ]);

  app(document.body, {}, node(App));

})();
