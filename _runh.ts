//@ts-nocheck
// import chalk from "chalk";
import "frida-java-bridge";
import * as utils from "./src/utils";
import { defaults, hookAll2, HookOptions } from "./src/hook2";

let fn = () => {

};

function run() {
  // hookAll2("com.huawei.smartpvms.view.MainActivity", "$init", fn, "", [], [])
  // hookAll2("android.app.Instrumentation", "newActivity", fn)
  // hookAll2("*myinfofragment*", "$init", fn)
  // hookAll2("android.app.BackStackRecord", "*", fn)
  // hookAll2("androidx.fragment.app.FragmentManager", "*", fn)
  let options:  HookOptions = {
    ...defaults,
    print: false
  }
  hookAll2("androidx.fragment.app.FragmentTransaction", "add", options)
  // utils.logFragmentParams()
  // utils.logActivities()
}

//@ts-expect-error
global.utils = utils;
global.run = run

export { run };
