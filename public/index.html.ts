import "./lib/custom";
import * as WindowLib from "./lib/windowlib";
import * as AMS from "./lib/ams";
import "./index.html.css";

$(() => {
  WindowLib.ToastUtils.showToast("Hello!!");

  // console.log("====variablemap====");
  // let map1 = new AMS.AMSVariableMap<string>();
  // map1.set("a", "hello");
  // let map2 = new AMS.AMSVariableMap<string>(map1);
  // map2.set("b", "world");
  // map2.set("a", "another");
  // map2.set("c", "!!!");
  // console.log(map2.toString());

  console.log("====absamsobject====");
  let parsed1 = AMS.AMSParser.parseAMS(
    `
AAA;BBB{
  XXX;
  YYY;
  ZZZ
}CCC;
/DDD{10}
`
  ).toString();
  console.log(parsed1);
});
