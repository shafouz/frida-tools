//@ts-nocheck
// import chalk from "chalk";
import "frida-java-bridge";
import * as utils from "./src/utils";
import { hookAll2 } from "./src/hook2";

let filters = {
  classFilters: [
  ],
  methodFilters: [
  ],
};

let options = {
  filters: filters,
  callback: (_this, args, ret) => {
    // console.log("got here");
    // utils.dumpStackTrace()
    // for (const arg in args) {
    //   global[`__args${arg}`] = Java.retain(args[arg]);
    // }
  },
  print: "off",
};

let fn = options["callback"];

function run() {
  // hookAll2("com.huawei.smartpvms.view.MainActivity", "$init", fn, "", [], [])
  // hookAll2("android.app.Instrumentation", "newActivity", fn)
  // hookAll2("*myinfofragment*", "$init", fn)
  // hookAll2("android.app.BackStackRecord", "*", fn)
  // hookAll2("androidx.fragment.app.FragmentManager", "*", fn)
  // hookAll2("androidx.fragment.app.FragmentTransaction", "add", fn)
  utils.logFragmentParams()
  utils.logActivities()
}

//@ts-expect-error
global.utils = utils;
global.run = run

export { run };
