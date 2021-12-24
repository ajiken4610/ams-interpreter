import "./lib/custom";
import * as WindowLib from "./lib/windowlib";
import * as AMS from "./lib/ams";
import "./index.html.css";

$(() => {
  WindowLib.ToastUtils.showToast("Hello!!");

  console.log("====variablemap====");
  let map1 = new AMS.AMSVariableMap<string>();
  map1.set("a", "hello");
  let map2 = new AMS.AMSVariableMap<string>(map1);
  map2.set("b", "world");
  console.log(map2.toString());
  map2.update("a", "another");
  console.log(map2.toString());
  map2.update("a", "world");
  map2.set("a", "another");
  console.log(map1.toString());
  console.log(map2.toString());

  console.log("====stringiterator====");
});
