// require("./lib.js");
// for (let i of [1, 2, 3]) console.log(i);
// console.log("main");

import { ToyReact, Component } from "./ToyReact";

class MyComponent extends Component {
  render() {
    return (
      <div>
        MyComponent
        <div>Hello</div>
        <div>World</div>
        <div>
          {true}
          {this.children}
        </div>
      </div>
    );
  }
}

let a = (
  <MyComponent name="a" id="a_id">
    <div>children-data</div>
  </MyComponent>
);
// console.log(a);
// document.body.appendChild(a);
ToyReact.render(a, document.body);
