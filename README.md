example \_run.ts:

```typescript
import "frida-java-bridge";
import \* as utils from "./src/utils";
import { hookAll } from "./src/hookAll";
import { hook2, hookAll2 } from "./src/hook2";

function callback(\_this, args, ret) {
  for (const arg in args) {
    global[`__args${arg}`] = Java.retain(args[arg]);
  },
};

let fn = callback;

function run() {
  hookAll2(
    "com.android.vending",
    "",
    fn,
    "",
    ["AjcClosure"],
    ["_around", "trackAPIPerf"]
  );
}

//@ts-expect-error
global.utils = utils;

export { run };
```
