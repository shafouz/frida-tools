//@ts-nocheck
// import chalk from "chalk";
import "frida-java-bridge";
import * as utils from "./src/utils";
import { hookAll } from "./src/hookAll";
import { hook2, hookAll2 } from "./src/hook2";

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
    for (const arg in args) {
      global[`__args${arg}`] = Java.retain(args[arg]);
    }
  },
  print: "on",
};

let fn = options["callback"];

function run() {
  Java.performNow(() => {
    global.hi = utils.javaRandomInt()
  })
}

//@ts-expect-error
global.utils = utils;
global.run = run

export { run };
