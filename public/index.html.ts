import "./lib/custom";

import * as WindowLib from "./lib/windowlib";
import * as AMS from "./lib/ams";
import "./lib/windowlib.css";
import "/index.html.css";

$(() => {
  WindowLib.ToastUtils.showToast("Hello!!");
});
