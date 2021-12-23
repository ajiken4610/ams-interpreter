import "./lib/custom";

import * as WindowLib from "./lib/windowlib";
import * as AMS from "./lib/ams";
import "./lib/windowlib.css";
import "./index.html.css";

$(() => {
  WindowLib.ToastUtils.showToast("Hello!!");
  let map1 = new AMS.AMSVariableMap<string>();
  map1.set("a", "hello");
  let map2 = new AMS.AMSVariableMap<string>(map1);
  map2.set("b", "world");
  console.log(map2);
  console.log(map2.get("a"));
  console.log(map2.get("b"));
  console.log(map2.has("a") && map2.has("b"));
});
