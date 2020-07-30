class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type);
  }
  setAttribute(name, value) {
    // 针对函数进行处理
    // 匹配onEvent格式的参数名
    if (name.match(/^on([\s\S]+)$/)) {
      // 将on[Event] 中的Event转换为小写
      let eventName = RegExp.$1.replace(/^[\s\S]/, (s) => s.toLowerCase());
      this.root.addEventListener(eventName, value);
    }
    // 特殊处理className
    if (name === "className") name = "class";
    this.root.setAttribute(name, value);
  }
  appendChild(vchild) {
    let range = document.createRange();
    if (this.root.children.length) {
      range.setStartAfter(this.root.lastChild);
      range.setEndAfter(this.root.lastChild);
    } else {
      range.setStart(this.root, 0);
      range.setEnd(this.root, 0);
    }
    vchild.mountTo(range);
  }
  mountTo(range) {
    range.deleteContents();
    range.insertNode(this.root);
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content);
  }
  mountTo(range) {
    range.deleteContents();
    range.insertNode(this.root);
  }
}

export class Component {
  constructor() {
    this.children = [];
    this.props = Object.create(null);
  }
  setAttribute(name, value) {
    if (name.match(/^on([\s\S]+)$/)) {
      console.log(RegExp.$1);
    }
    this.props[name] = value;
    this[name] = value;
  }
  mountTo(range) {
    this.range = range;
    this.update();
  }
  update() {
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
    console.log(this.state);
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
