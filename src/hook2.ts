//@ts-nocheck
import chalk from "chalk";
import { findLoadedClass, formatObjectObject } from "./utils";

const defaults = {
  callback: ()=>{},
  stack_trace_filter: "",
  klass_filters: [],
  method_filters: [],
  print: true
}

type HookOptions = {
  callback: Function;
  stack_trace_filter: string;
  klass_filters: string[];
  method_filters: string[];
  print: boolean;
};

/**
 * Tries and hook whatever is specified by klass_name and function_name
 * Does not uses regex, but you can glob with `*`.
 *
 * @param {string} klass_name - class name
 * @param {string} function_name - function name
 * @param {HookOptions} options - possible options for hooks
**/
function hookAll2(
  klass_name: string,
  function_name: string,
  options: HookOptions
) {
  setTimeout(function() {
    Java.perform(function() {
      console.log(chalk.blueBright("Starting hookAll"));

      let klasses = findLoadedClass(klass_name);

      for (const fqcn of klasses) {
        if (options.klass_filters.length !== 0) {
          if (
            options.klass_filters.some(
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
        handleMethods(klass, methods, options);
      }

      console.log(chalk.blueBright("Finished hookAll"));
    });
  }, 0);
}

function handleMethods(
  klass: string,
  methods: string[],
  options: HookOptions
) {
  global.hook2 = []
  const fqcn = klass.$className;
  let overloadCount = 0;

  for (const method of methods) {
    if (options.method_filters.length !== 0) {
      if (
        options.method_filters.some(
          (m) =>
            method.toLowerCase().indexOf(m.toLowerCase()) !== -1 && m !== ""
        )
      )
        continue;
    }

    try {
      overloadCount = klass[method].overloads.length;
    } catch (e) {
      continue;
    }

    console.log(chalk.blueBright(`->`), `${fqcn}.${method}`);
    for (let i = 0; i < overloadCount; i++) {
      klass[method].overloads[i].implementation = function() {
        let locals = {
          fqcn: fqcn,
          method: method,
          this: null,
          return_value: null,
          args: [],
          err: []
        }
        let output = []

        let stack_trace: String = Java.use(
          "android.util.Log"
        ).getStackTraceString(Java.use("java.lang.Exception").$new());

        // if the filter is not empty
        // and what you looking at in the trace is not found 
        if (
          options.stack_trace_filter !== "" && stack_trace.indexOf(options.stack_trace_filter) === -1
        ) {
          return this[method](...arguments);
        }

        let return_value = this[method](...arguments);

        output.push(chalk.blueBright(`\n[===] Class name [===]`));
        output.push(chalk.whiteBright(`${fqcn}`));
        output.push(chalk.blueBright(`[===] Method name [===]`));
        output.push(chalk.whiteBright(`${method}`));
        output.push(chalk.blueBright(`[===] this [===]`));
        output.push(chalk.whiteBright(`${this}`));
        output.push(chalk.blueBright("[===] function [===]"));

        try {
          output.push(
            chalk.whiteBright(options.callback(this, arguments, return_value))
          );
        } catch (e) {
          output.push(chalk.red(e));
          locals.err = e
        }

        output.push(chalk.yellowBright("\n[===] args [===]"));
        let k = 1;
        for (const arg of arguments) {
          output.push(chalk.yellowBright(`[+] arg${k}: ${formatObjectObject(arg)}`));
          k++;
        }

        output.push(
          chalk.magentaBright(`\nreturn_value:  ${formatObjectObject(return_value)}\n`)
        );
        output.push(
          chalk.grey(
            "--------------------------------------------------------\n"
          )
        );

        if (options.print) {
          console.log(output.join("\n"));
        }

        for (const k of ['this', 'return_value', 'arguments']) {
          if (k == 'arguments') {
            for (const [i, arg] of Array.from(arguments).entries()) {
              try {
                locals.args.push(Java.retain(arg))
              } catch (e) {
                if (e.message.indexOf("not a function") != -1) {
                  locals.args.push(arg)
                } else {
                  locals.err.push(`${e}, \`arg: ${i}\``)
                }
              }
            }
            continue
          }

          try {
            locals[k] = Java.retain(eval(k))
          } catch (e) {
            if (e.message.indexOf("not a function") != -1) {
              locals[k] = eval(k)
            } else {
              locals.err.push(`${e}, \`${i}\``)
            }
          }
        }

        global.hook2.push(locals)
        return return_value;
      };
    }
  }
}

function getMethods(klass: String, function_name: String) {
  let methods_raw = Java.enumerateMethods(`${klass}!${function_name}/i`);
  if (methods_raw.length > 1) {
    console.log(
      chalk.red(`Error, too many loaders. ${JSON.stringify(methods_raw)}`)
    );
    return [];
  } else if (methods_raw.length === 0) {
    return [];
  }

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

export { hookAll2, HookOptions, defaults };
