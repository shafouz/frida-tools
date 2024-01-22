//@ts-nocheck
import chalk from "chalk";
import { findLoadedClass, printObject } from "./utils";

function hook2(
  fqcn: String,
  function_name: String,
  callback: Function,
  stack_trace_filter: String = ""
) {
  setTimeout(function() {
    Java.perform(function() {
      console.log(chalk.blueBright(`trying:`), `${fqcn}.${function_name}`);

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
          let stack_trace: String = Java.use(
            "android.util.Log"
          ).getStackTraceString(Java.use("java.lang.Exception").$new());

          // if the filter is not empty
          // and what you looking at in the trace is not found 
          if (
            stack_trace_filter !== "" &&
            stack_trace
              .toLowerCase()
              .indexOf(stack_trace_filter.toLowerCase()) === -1
          ) {
            return this[function_name](...arguments);
          }

          // global.__this = Java.retain(this);

          let output = [];

          try {
          } catch { }

          var return_value = this[function_name](...arguments);

          output.push(chalk.blueBright(`\n[===] Class name [===]`));
          output.push(chalk.whiteBright(`${fqcn}`));
          output.push(chalk.blueBright(`[===] Method name [===]`));
          output.push(chalk.whiteBright(`${function_name}`));
          output.push(chalk.blueBright(`[===] this [===]`));
          output.push(chalk.whiteBright(`${this}`));
          output.push(chalk.blueBright("[===] function [===]"));

          try {
            output.push(
              chalk.whiteBright(callback(this, arguments, return_value))
            );
          } catch (e) {
            output.push(chalk.red(e));
          }

          output.push(chalk.yellowBright("\n[===] args [===]"));
          let k = 1;
          for (const arg of arguments) {
            output.push(chalk.yellowBright(`[+] arg${k}: ${printObject(arg)}`));
            k++;
          }

          output.push(
            chalk.magentaBright(
              `\nreturn_value:  ${printObject(return_value)}\n`
            )
          );
          output.push(
            chalk.grey(
              "--------------------------------------------------------\n"
            )
          );

          console.log(output.join("\n"));
          return return_value;
        };
      }
    });
  }, 0);
}

/**
 * Tries and hook whatever is specified by klass_name and function_name
 * Does not uses regex, but you can glob with `*`.
 *
 * @param {string} klass_name - class name
 * @param {string} function_name - function name
 * @param {Function} callback - function to run inside the hook
 * @param {string} stack_trace_filter - Only prints if filter is in the function stack trace, using java.lang.Exception/android.util.log
 * @param {string[]} klass_filters - list of class names to skip hooking
 * @param {string[]} method_filters - list of method names to skip hooking
**/
function hookAll2(
  klass_name: String,
  function_name: String,
  callback: Function,
  stack_trace_filter: String = "",
  klass_filters: String[] = [],
  method_filters: String[] = []
) {
  setTimeout(function() {
    Java.perform(function() {
      console.log(chalk.blueBright("Starting hookAll"));
      let klasses = findLoadedClass(klass_name);

      handleKlasses(
        klasses,
        function_name,
        callback,
        stack_trace_filter,
        klass_filters,
        method_filters
      );
      console.log(chalk.blueBright("Finished hookAll"));
    });
  }, 0);
}

function handleKlasses(
  klasses: Array,
  function_name: String,
  callback: Function,
  stack_trace_filter: String = "",
  klass_filters: String[] = [],
  method_filters: String[] = []
) {
  for (const fqcn of klasses) {
    if (klass_filters.length !== 0) {
      if (
        klass_filters.some(
          (k) => fqcn.toLowerCase().indexOf(k.toLowerCase()) !== -1 && k !== ""
        )
      )
        continue;
    }

    let methods: Array = getMethods(fqcn, function_name);

    if (methods.length === 0) {
      continue;
    }

    let klass = Java.use(fqcn);
    handleMethods(klass, methods, callback, stack_trace_filter, method_filters);
  }
}

function handleMethods(
  klass,
  methods: String[],
  callback: Function,
  stack_trace_filter: String = "",
  method_filters: String[]
) {
  for (const method of methods) {
    if (method_filters.length !== 0) {
      if (
        method_filters.some(
          (m) =>
            method.toLowerCase().indexOf(m.toLowerCase()) !== -1 && m !== ""
        )
      )
        continue;
    }

    let overloadCount = 0;

    try {
      overloadCount = klass[method].overloads.length;
    } catch (e) {
      continue;
    }

    const fqcn = klass.$className;
    console.log(chalk.blueBright(`->`), `${fqcn}.${method}`);

    for (let i = 0; i < overloadCount; i++) {
      klass[method].overloads[i].implementation = function() {
        let stack_trace: String = Java.use(
          "android.util.Log"
        ).getStackTraceString(Java.use("java.lang.Exception").$new());

        // if the filter is not empty
        // and what you looking at in the trace is not found 
        if (
          stack_trace_filter !== "" && stack_trace.indexOf(stack_trace_filter) === -1
        ) {
          return this[method](...arguments);
        }

        // global.__this = Java.retain(this);

        let output = [];
        var return_value = this[method](...arguments);

        output.push(chalk.blueBright(`\n[===] Class name [===]`));
        output.push(chalk.whiteBright(`${fqcn}`));
        output.push(chalk.blueBright(`[===] Method name [===]`));
        output.push(chalk.whiteBright(`${method}`));
        output.push(chalk.blueBright(`[===] this [===]`));
        output.push(chalk.whiteBright(`${this}`));
        output.push(chalk.blueBright("[===] function [===]"));

        try {
          output.push(
            chalk.whiteBright(callback(this, arguments, return_value))
          );
        } catch (e) {
          output.push(chalk.red(e));
        }

        output.push(chalk.yellowBright("\n[===] args [===]"));
        let k = 1;
        for (const arg of arguments) {
          output.push(chalk.yellowBright(`[+] arg${k}: ${printObject(arg)}`));
          k++;
        }

        output.push(
          chalk.magentaBright(`\nreturn_value:  ${printObject(return_value)}\n`)
        );
        output.push(
          chalk.grey(
            "--------------------------------------------------------\n"
          )
        );

        console.log(output.join("\n"));
        return return_value;
      };
    }
  }
}

function getMethods(klass: String, function_name: String) {
  // console.log(chalk.blueBright("klass:"), klass);
  let methods_raw = Java.enumerateMethods(`${klass}!*${function_name}*/i`);
  // if (
  //   klass.indexOf(
  //     "com.iherb.mobile.prepay.checkout.expresspaypal.PaypalActivity"
  //   ) !== -1
  // ) {
  //   console.log(JSON.stringify(methods_raw));
  // }
  if (methods_raw.length > 1) {
    console.log(
      chalk.red(`Error, too many loaders. ${JSON.stringify(methods_raw)}`)
    );
    return [];
  } else if (methods_raw.length === 0) {
    return [];
  }

  // console.log(
  //   "DEBUGPRINT[5]: hook2.ts:153: methods_raw=",
  //   JSON.stringify(methods_raw)
  // );

  for (const loader of methods_raw) {
    if (loader["classes"].length > 1) {
      console.log(chalk.red(`Error, more than one class matched. ${klass}`));
      return [];
    } else if (loader["classes"].length === 0) {
      console.log(chalk.red(`Error, class not found. ${klass}`));
      return [];
    }

    return loader["classes"][0]["methods"];
  }
}

export { hook2, hookAll2 };
