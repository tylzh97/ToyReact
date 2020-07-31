let childrenSymbol = Symbol("children");

class ElementWrapper {
  constructor(type) {
    // 节点类型
    this.type = type;
    // 父节点参数
    this.props = Object.create(null);
    // this.root = document.createElement(type);
    this[childrenSymbol] = [];
  }
  get vdom() {
    return this;
  }
  get children() {
    return this[childrenSymbol].map((child) => child.vdom);
  }
  get vdom() {
    return this;
  }
  setAttribute(name, value) {
    // // 针对函数进行处理
    // // 匹配onEvent格式的参数名
    // if (name.match(/^on([\s\S]+)$/)) {
    //   // 将on[Event] 中的Event转换为小写
    //   let eventName = RegExp.$1.replace(/^[\s\S]/, (s) => s.toLowerCase());
    //   this.root.addEventListener(eventName, value);
    // }
    // // 特殊处理className
    // if (name === "className") name = "class";
    // this.root.setAttribute(name, value);
    this.props[name] = value;
  }
  appendChild(vchild) {
    this[childrenSymbol].push(vchild);
    this.children.push(vchild.vdom);
    /*let range = document.createRange();
    if (this.root.children.length) {
      range.setStartAfter(this.root.lastChild);
      range.setEndAfter(this.root.lastChild);
    } else {
      range.setStart(this.root, 0);
      range.setEnd(this.root, 0);
    }
    vchild.mountTo(range);*/
  }
  mountTo(range) {
    // range.deleteContents();
    // range.insertNode(this.root);
    this.range = range;

    let placehoader = document.createComment("placeholder");
    let endRange = document.createRange();
    endRange.setStart(range.endContainer, range.endOffset);
    endRange.setEnd(range.endContainer, range.endOffset);
    endRange.insertNode(placehoader);

    range.deleteContents();
    let element = document.createElement(this.type);

    for (let name in this.props) {
      let value = this.props[name];
      if (name.match(/^on([\s\S]+)$/)) {
        let eventName = RegExp.$1.replace(/^[\s\S]/, (s) => s.toLowerCase());
        element.addEventListener(eventName, value);
      }
      if (name === "className") element.setAttribute("class", value);
      element.setAttribute(name, value);
    }

    for (let child of this.children) {
      let range = document.createRange();
      if (element.children.length) {
        range.setStartAfter(element.lastChild);
        range.setEndAfter(element.lastChild);
      } else {
        range.setStart(element, 0);
        range.setEnd(element, 0);
      }
      child.mountTo(range);
    }

    range.insertNode(element);
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content);
    this.type = "#text";
    this.children = [];
    this.props = Object.create[null];
  }
  mountTo(range) {
    this.range = range;
    range.deleteContents();
    range.insertNode(this.root);
  }
  get vdom() {
    return this;
  }
}

export class Component {
  constructor() {
    this.children = [];
    this.props = Object.create(null);
  }
  get type() {
    // 获取子类类名
    return this.constructor.name;
  }
  setAttribute(name, value) {
    if (name.match(/^on([\s\S]+)$/)) {
      // console.log(RegExp.$1);
    }
    this.props[name] = value;
    this[name] = value;
  }
  mountTo(range) {
    this.range = range;
    this.update();
  }
  get vdom() {
    return this.render().vdom;
  }
  // TODO
  update() {
    /*
    // 使用range时, 如果前一个节点位置被删除过,则range标记位置会发生偏移
    // 此处使用一个注释DOM对象,用于标记位置
    let placeholder = document.createComment("placeholder");
    let range = document.createRange();
    // 创建一个新的range
    range.setStart(this.range.endContainer, this.range.endOffset);
    range.setEnd(this.range.endContainer, this.range.endOffset);
    // 在range中插入占位符
    range.insertNode(placeholder);
    // 清除DOM对象
    this.range.deleteContents();
    // 重新渲染组件, 获取新的虚拟DOM
    let vdom = this.render();
    // 将更新后的DOM对象重新挂载到原位置
    vdom.mountTo(this.range);
    // 在清除占位符后, range会发生偏移,因此暂时无法清除占位符
    // placeholder.parentNode.removeChild(placehoader)
    */
    let vdom = this.vdom;
    if (this.oldVdom) {
      let isSameNode = (node1, node2) => {
        if (node1.type !== node2.type) return false;
        for (let name in node1.props) {
          if (
            typeof node1.props[name] === "objects" &&
            typeof node2.props[name] === "object" &&
            JSON.stringify(node1.props[name]) ===
              JSON.stringify(node2.props[name])
          )
            continue;
          if (node1.props[name] !== node2.props[name]) return false;
        }
        if (Object.keys(node1.props).length !== Object.keys(node2.props).length)
          return false;
        return true;
      };
      let isSameTree = (node1, node2) => {
        if (!isSameNode(node1, node2)) return false;
        if (node1.children.length !== node2.children.length) return false;
        for (let i = 0; i < node1.children.length; i++) {
          if (!isSameTree(node1.children[i], node2.children[i])) return false;
        }
        return true;
      };
      let replace = (newTree, oldTree, indent) => {
        console.log(indent + "new: ", newTree);
        console.log(indent + "old: ", oldTree);
        if (isSameTree(newTree, oldTree)) {
          console.log("all Same");
          return;
        }
        if (isSameNode(newTree, oldTree)) {
          console.log("all Different");
          newTree.mountTo(oldTree.range);
        } else {
          for (let i = 0; i < newTree.children.length; i++) {
            replace(newTree.children[i], oldTree.children[i], "  " + indent);
          }
        }
      };
      replace(vdom, this.oldVdom, "");
    } else {
      vdom.mountTo(this.range);
    }
    this.oldVdom = vdom;

    // placehoader.parentNode.removeChild(placehoader);
  }
  appendChild(vchild) {
    this.children.push(vchild);
  }
  setState(state) {
    let merge = (oldState, newState) => {
      for (let p in newState) {
        if (typeof newState[p] === "object" && newState[p] !== null) {
          if (typeof oldState[p] !== "object") {
            if (newState[p] instanceof Array) oldState[p] = [];
            else oldState[p] = {};
          }
          merge(oldState[p], newState[p]);
        } else {
          oldState[p] = newState[p];
        }
      }
    };
    if (!this.state && state) {
      this.state = {};
    }
    merge(this.state, state);
    this.update();
  }
}

export let ToyReact = {
  createElement(type, attributes, ...children) {
    // 获取函数参数
    // console.log(arguments);
    // 浏览器断点
    // debugger;
    // return document.createElement(type);
    let element;
    if (typeof type === "string") element = new ElementWrapper(type);
    else element = new type();

    for (let name in attributes) {
      element.setAttribute(name, attributes[name]);
    }
    let insertChildren = (children) => {
      for (let child of children) {
        if (typeof child === "object" && child instanceof Array) {
          insertChildren(child);
        } else {
          if (child === null || child === void 0) child = "";
          if (
            !(child instanceof Component) &&
            !(child instanceof ElementWrapper) &&
            !(child instanceof TextWrapper)
          )
            child = String(child);
          if (typeof child === "string") child = new TextWrapper(child);
          element.appendChild(child);
        }
      }
    };
    insertChildren(children);
    return element;
  },
  render(vdom, element) {
    let range = document.createRange();
    if (element.children.length) {
      range.setStartAfter(element.lastChild);
      range.setEndAfter(element.lastChild);
    } else {
      range.setStart(element, 0);
      range.setEnd(element, 0);
    }
    vdom.mountTo(range);
    // element.appendChild(vdom);
  },
};
