//@ts-nocheck
import chalk from "chalk"
import { _hook } from "./utils"

export interface Filters {
  classFilters: String[]?;
  methodFilters: String[]?;
}

let filters: Filters = { classFilters: ["AjcClosure"], methodFilters: ["_aroundBody"] }

function hookAll(class_name: String, options: any){
  let filters = options["filters"]

  let classes = ""

  if (filters.classFilters || filters.methodFilters) {
    try {
      classes = getFilteredClasses(class_name, filters)
    } catch(e) {
      console.log(chalk.blueBright("class probably isnt loaded, use "+chalk.redBright("loadClassNow()")+chalk.blueBright(" with the full class name")))
      return
    }
  } else {
    classes = getClasses(class_name)
  }

  for (const klass of classes) {
    let methods = klass["methods"]

    for (const method of methods) {
      try {
        _hook(klass.name, method, options["callback"], options["print"])
      } catch(e) {
        console.log(chalk.red(e))
        return
      }
    }
    console.log(chalk.greenBright(`${klass.name} methods hooked.`))
  }
}

function getFilteredClasses(class_name, filters){
  let _klass = Java.enumerateMethods(`*${class_name}*!*/i`)[0]["classes"]
  return applyFilters(_klass, filters)
}

function getClasses(class_name){
  let _klass = Java.enumerateMethods(`*${class_name}*!*/i`)[0]["classes"]
  return _klass 
}

function applyFilters(list: Array<any>, filters: Filters){
  let classes = list
  if (filters.classFilters) { classes = filterClasses(classes, filters) }
  if (filters.methodFilters) { classes = filterMethods(classes, filters) }
  return classes
}

function filterClasses(classes, filters){
  let class_filter = new RegExp(filters.classFilters.join("|"), 'i')

  return classes.filter((el) => {
    if (!class_filter.test(el.name)) return el
  })
}

function filterMethods(classes, filters){
  let method_filter = new RegExp(filters.methodFilters.join("|"), 'i')
  let finalclasses = []

  classes.forEach(klass => {
    let name = klass.name
    let methods = klass["methods"].filter((method_name) => {
      if (!method_filter.test(method_name)) { 
        return method_name
      }
    })

    finalclasses.push({
      name: name,
      methods: methods
    })
  });

  return finalclasses
}

export { hookAll, applyFilters, getClasses }
