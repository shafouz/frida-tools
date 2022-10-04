//@ts-nocheck
import chalk from "chalk"
import { _hook } from "./utils"

export interface Filters {
  classFilters: String[]?;
  methodFilters: String[]?;
}

let filters: Filters = { classFilters: ["AjcClosure"], methodFilters: ["_aroundBody"] }

function hookAll(class_name: String, options: any){
  let default_filters = { 
    classFilters: ["AjcClosure"],
    methodFilters: ["_aroundBody"] 
  }

  let filters = options["filters"]
  ? {
      classFilters: [...default_filters.classFilters, ...options["filters"].classFilters],
      methodFilters: [...default_filters.methodFilters, ...options["filters"].methodFilters]
    } 
  : default_filters

  let classes = getFilteredClasses(class_name, filters)

  for (const klass of classes) {
    let methods = klass["methods"]

    for (const method of methods) {
      try {
        _hook(klass.name, method, options["callback"], options["print"])
      } catch(e) {
        console.log(chalk.red(e))
      }
    }
  }
}

function getFilteredClasses(class_name, filters){
  let _klass = Java.enumerateMethods(`*${class_name}*!*/i`)[0]["classes"]
  return applyFilters(_klass, filters)
}

function getClasses(class_name){
  let _klass = Java.enumerateMethods(`*${class_name}*!*/i`)
  let classes = _klass[0]["classes"]

  return classes
}

// remove classes, remove methods
function applyFilters(list: Array<any>, filters: Filters){
  return _filter(list, filters)
}

function _filter(list, filters){
  let class_filter = new RegExp(filters.classFilters.join("|"), 'i')
  let method_filter = new RegExp(filters.methodFilters.join("|"), 'i')

  let classes = list.filter((el) => {
    if (!class_filter.test(el.name)) return el
  })

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
