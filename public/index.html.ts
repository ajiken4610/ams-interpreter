import * as WindowLib from "./lib/windowlib";
import * as AMS from "./lib/ams";
import "./index.html.scss";

$(() => {
    WindowLib.ToastUtils.showToast("Hello!!");

    // console.log("====variablemap====");
    // let map1 = new AMS.AMSVariableMap<string>();
    // let map2 = new AMS.AMSVariableMap<string>(map1);
    // let map3 = new AMS.AMSVariableMap<string>(map2);
    // map1.set("a", "hello");
    // map2.set("b", "world");
    // map2.set("a", "another");
    // map2.set("c", "!!!");
    // map3.set("d", "D is here");
    // console.log(map3.toString());

    // console.log("====stringiterator====");
    // let iterator = new AMS.StringIterator("Hello,world!!\nthis is a pen");
    // while (iterator.hasNext()) {
    //     console.log(iterator.readBeforeChar(",!"));
    // }

    console.log("====absamsobject====");
    let parsed1 = AMS.AMSParser.parseAMS(
        `
    AAA;
    BBB;
    /DDD{10};
    /DDD
    `
    );
    console.log(parsed1);
    console.log(parsed1.toHtml());
});
