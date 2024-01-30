//@ts-nocheck
// import chalk from "chalk";
import "frida-java-bridge";
import * as utils from "./src/utils";
import { hook2, defaults, hookAll2 } from "./src/hook2";

// let options:  HookOptions = {
//   ...defaults,
//   print: true,
//   overwrite_ret: true
// }

function run() {
  // hookAll2("android.app.Instrumentation", "newActivity", {
  //   ...defaults, callback: () => {
  //   }
  // })
  // hookAll2("com.huawei.smartpvms.base.MainActivity", "$init", { ...defaults, print: true, callback: () => {} })
  hook2("com.huawei.smartpvms.base.BaseActivity", "onCreate", { ...defaults, print: true, callback: () => { return utils.dumpStackTrace() } })
  // hookAll2("dalvik.system.PathClassLoader", "*", {
  //   ...defaults,
  //   print: false,
  //   callback: (_this, args, _) => {
  //     console.log("DEBUGPRINT[1]: _runh.ts:23: args[0]=", args[0])
  //   }
  // })
  // hookAll2("dalvik.system.DexClassLoader", "*", { ...defaults, stack_trace_filter: "huawei" })
  // hookAll2("dalvik.system.BaseDexClassLoader", "$init", { ...defaults, stack_trace_filter: "huawei" })
  // hookAll2("*FragmentActivity*", "onCreate", { ...defaults, callback: ()=>{ utils.dumpStackTrace() } })

  //
  // } })
  // hookAll2("android.app.Instrumentation", "newActivity", fn)
  // hookAll2("*myinfofragment*", "$init", fn)
  // hookAll2("android.app.BackStackRecord", "*", fn)
  // hookAll2("androidx.fragment.app.FragmentManager", "*", fn)
  // hookAll2("com.huawei.smartpvms.utils.SharedPreferencesUtil", "isFirstStartApp", {
  //   ...defaults,
  //   print: true,
  //   overwrite_ret: true
  // })
  // hookAll2("com.huawei.smartpvms.view.login.AppGuideActivity", "checkPreLogin", { ...defaults, print: false })
  // hookAll2("com.huawei.secure.android.common.detect.SecurityDetect", "*", { ...defaults, print: false })
  // hookAll2("java.lang.System", "loadLibrary", { ...defaults })
  // hookAll2("com.huawei.secure.android.common.detect.SD", "*", { ...defaults })
  // hookAll2("com.huawei.secure.android.common.detect.SD", "*", { ...defaults })
  // hookAll2("SecurityDetect", "*", options)
  // hookAll2("SecurityDetect", "*", options)
  // hookAll2("*", "isFirstStartApp", options)
  // hookAll2("androidx.fragment.app.FragmentTransaction", "add", options)
  // utils.logFragmentParams()
  // utils.logActivities()
}

//@ts-expect-error
global.utils = utils;
global.run = run;
global.hook2 = [];

export { run };
