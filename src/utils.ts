//@ts-nocheck
import chalk from "chalk";
import { hookAll2 } from "./hook2";

function get_called_methods(){
  return Array.from(new Set(global.hook2.flatMap(e => { return e['fqcn'] + ' ! ' + e['method'] })))
}

function dumpStackTrace() {
  let exp_string = Java.use("android.util.Log").getStackTraceString(
    Java.use("java.lang.Exception").$new()
  );

  console.log(chalk.magenta(exp_string));
  return exp_string
}

function printObject(arg): string {
  if (arg !== undefined && arg !== null) {
    return arg.toString() == "[object Object]"
      ? JSON.stringify(arg)
      : arg.toString();
  }
}

function searchMethod(klass, method) {
  return Java.enumerateMethods(`*${klass}*!*${method}*/i`);
}

var _use = function _use(klass) {
  try {
    return Java.use(klass);
  } catch {
    return loadClassNow(klass);
  }
};

function dumpJavaMap(map) {
  for (const header of map.entrySet().toArray()) {
    console.log(chalk.blue(`map: ${header.toString()}`));
  }
}

function dumpGetMethods(arg) {
  let method_list = [];

  try {
    method_list = Object.keys(arg).filter((key) =>
      key.toString().startsWith("get")
    );
  } catch {
    console.log(chalk.red("cannot convert to object???"));
    return;
  }

  for (const method of method_list) {
    try {
      let temp = arguments[0][method]();
      if (temp == undefined || temp == null || temp == "") continue;
      console.log(
        chalk.blueBright(`${method.split("get")[1]}: `) +
        chalk.whiteBright(`${printObject(temp)}`)
      );
    } catch {
      continue;
    }
  }
}

function dumpIntent(intent) {
  console.log(chalk.blue("[+] Dump: "));
  for (const key of Object.keys(intent)) {
    if (key.indexOf("get") != -1) {
      try {
        let temp = eval(`intent.${key}()`);

        if (
          temp == null ||
          temp == undefined ||
          key == "getDataString" ||
          temp == "null"
        )
          continue;
        if (key == "getCategories") temp = temp.toArray().toString();

        console.log(
          chalk.blueBright(`${key.slice(3)}: `) + chalk.whiteBright(`${temp}`)
        );
      } catch {
        continue;
      }
    }
  }
}

function objKeys(obj) {
  for (const key of Object.keys(obj)) {
    console.log(chalk.blueBright(`[+] key: `) + chalk.whiteBright(`${key}`));
  }
}

function benchmark(fn) {
  const startTime = new Date().getTime();
  fn();
  const endTime = new Date().getTime();
  const elapsedTime = endTime - startTime;
  console.log(`Elapsed time: ${elapsedTime} milliseconds`);
}

function logActivities(){
  hookAll2("android.app.Instrumentation", "newActivity", (_this, args, ret) => {
    console.log("DEBUGPRINT[3]: utils.ts:112: _this=", _this)
    let intent = Array.from(args)[2]
    console.log(`=> ${ret.$className}\n  => ${intent.toString()}\n  => ${intent.getExtras().toString()}`)
  })
}

function logFragmentParams(){
  hookAll2("androidx.fragment.app.FragmentTransaction", "add", (_this, args, ret) => {
    try {
      console.log(`=> ${args[1].$className}\n  => ${args[1].getArguments().toString()}`)
    } catch {
    }
  })
}

/**
  Searches for a class name using the frida's enumerateLoadedClassesSync.
  Will fuzzy search if a star is in className otherwise it needs an exact match

  @param {string} className - Can be fuzzy searched with '\*'
**/
function findLoadedClass(className) {
  if (className.indexOf("*") !== -1) {
    let filters = className.split("*");

    return Java.enumerateLoadedClassesSync().filter((k) =>
      filters.every((filter) => {
        return k.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
      })
    );
  }

  return Java.enumerateLoadedClassesSync().filter((k) => k == className)
}

function loadClassNow(myClass) {
  let c = "";
  console.log("Searching:", myClass)
  Java.perform(() => {
    const classLoaders = Java.enumerateClassLoadersSync();
    for (const classLoader in classLoaders) {
      try {
        classLoader.findClass(myClass);
        Java.classFactory.get(loader);
        break;
      } catch (e) {
        continue;
      }
    }
    c = Java.use(myClass);
  });
  return c;
}

const use = {
  Thread: _use("java.lang.Thread"),
  Locale: _use("java.util.Locale"),
  Intent: _use("android.content.Intent"),
  Uri: _use("android.net.Uri"),
  Object: _use("java.lang.Object"),
  String: _use("java.lang.String"),
  ArrayList: _use("java.util.ArrayList"),
  Context: _use("android.content.Context"),
  Bundle: _use("android.os.Bundle"),
  Activity: _use("android.app.Activity"),
  Exception: _use("java.lang.Exception"),
  Map: _use("java.util.Map"),
  ActivityThread: _use('android.app.ActivityThread')
};

// const iherb = {
//   Paths: _use("com.iherb.mobile.base.legacy.classes.Paths"),
//   Extra: _use("com.iherb.mobile.base.legacy.classes.Extra"),
//   CheckoutServiceImpl: _use("com.iherb.mobile.prepay.CheckoutServiceImpl"),
// };

function _hook(fqcn, function_name, fn, print = "on") {
  setTimeout(function() {
    Java.perform(function() {
      let klass = Java.use(`${fqcn}`);
      let method = function_name;
      let overloadCount = 0;

      try {
        overloadCount = klass[method].overloads.length;
      } catch (e) {
        return;
      }

      for (let i = 0; i < overloadCount; i++) {
        klass[method].overloads[i].implementation = function() {
          if (print === "on") {
            global.__this = Java.retain(this);

            try {
            } catch { }

            var return_value = this[function_name](...arguments);

            console.log(chalk.blueBright(`\n[===] Class name [===]`));
            console.log(chalk.whiteBright(`${fqcn}`));
            console.log(chalk.blueBright(`[===] Method name [===]`));
            console.log(chalk.whiteBright(`${function_name}`));
            console.log(chalk.blueBright(`[===] this [===]`));
            console.log(chalk.whiteBright(`${this}`));

            console.log(chalk.blueBright("[===] function [===]"));
            try {
              fn(this, arguments, return_value);
            } catch (e) {
              console.log(chalk.red(e));
            }

            console.log(chalk.yellowBright("\n[===] args [===]"));
            let k = 1;
            for (const arg of arguments) {
              console.log(
                chalk.yellowBright(`[+] arg${k}: ${printObject(arg)}`)
              );
              k++;
            }

            console.log(
              chalk.magentaBright(
                `\nreturn_value:  ${printObject(return_value)}\n`
              )
            );
            console.log(
              chalk.grey(
                "--------------------------------------------------------\n"
              )
            );

            return return_value;
          } else {
            global.__this = Java.retain(this);

            try {
            } catch { }

            var return_value = this[function_name](...arguments);

            try {
              fn(this, arguments, return_value);
            } catch (e) {
              console.log(chalk.red(e));
            }

            let k = 1;

            return return_value;
          }
        };
      }
    });
  }, 0);
}

function javaRandomInt(){
  return Java.use("java.util.Random").$new().nextInt()
}

function startActivity(activity, options) {
  if (options["method"]) utils._hook(activity, options["method"], _fn);

  Java.perform(() => {
    Java.scheduleOnMainThread(function() {
      var context = Java.use("android.app.ActivityThread")
        .currentApplication()
        .getApplicationContext();

      var klass = utils.loadClassNow(activity).$new().getClass();

      var intent = utils.use.Intent;
      intent = intent.$new(context, klass);
      intent.setFlags(268435456);
      intent.putExtra("LAYOUT_ID", 1000000);

      context.startActivity(intent);
    });
  });
}

function get_path_handler_mapping() {
  Java.perform(() => {
    let map = Java.use(
      "com.iherb.mobile.commons.utils.deeplink.DeepLinkResolver"
    )
      .$new()
      .access$getMap$cp();

    let objs = Java.use("com.iherb.mobile.commons.utils.deeplink.DeepLinkType")
      .values()
      .map((e) => {
        let t = { type: e, path: e.getPath() };
        let entry = map.get(e);

        if (entry == null || entry == undefined) {
          return {};
        }

        return {
          klass: entry.toString().split("@")[0],
          path: t.path,
        };
      })
      .filter((e) => e.klass != undefined && e.klass != null);

    for (const { klass, path } of objs) {
      console.log(`${chalk.blueBright(path)} -> ${klass}`);
    }
  });
}

export {
  javaRandomInt,
  iherb,
  use,
  _hook,
  searchMethod,
  dumpJavaMap,
  dumpIntent,
  dumpGetMethods,
  hookAll,
  dumpStackTrace,
  objKeys,
  loadClassNow,
  findLoadedClass,
  printObject,
  get_path_handler_mapping,
  get_called_methods,
  logFragmentParams,
  logActivities
};
