// import chalk from "chalk";
import "frida-java-bridge"
// import * as utils from "./src/utils"
import { hookAll } from "./src/hookAll"


let filters = {
  classFilters: ["abc"],
  methodFilters: []
}

let options = {
  filters: filters
}

let klass = "com.iherb.app.other.mock.MockActivity"

// let classes = getClasses("com.iherb.app.other.mock.MockActivity")
// let k = applyFilters(classes, filters)

// for (const _k of k) {
//   console.log(JSON.stringify(_k)+"\n")
// }
// utils.objKeys(methods[0]["classes"])


// enumerateMethods, hook everything that has an implementation

function run(){
  hookAll("com.iherb.app.other.mock.MockActivity", options)
}

run()
//

// global.utils = utils
