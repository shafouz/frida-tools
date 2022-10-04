//@ts-nocheck
// import chalk from "chalk";
import "frida-java-bridge"
import * as utils from "./src/utils"
import { hookAll } from "./src/hookAll"


let filters = {
  classFilters: [
    "AjcClosure",
    "observeViewModel",
    "inlined",
    "ExternalSynthetic",
    "observePayment"
    // "Slider",
    // "Layout",
    // "com.iherb.aop.CrashHandleAspect",
    // "com.iherb.mobile.cms.ResourcesWrapper",
    // "CustomPromoBannerView",
    // "PagerIndicatorSupportRtl",
    // "cms.IherbResource",
    // "cms.CMSresources",
    // "com.iherb.mobile.commons.views.sothree.slidinguppanel.canvassaveproxy.LegacyCanvasSaveProxy",
    // "com.iherb.mobile.commons.views.sothree.slidinguppanel.ViewDragHelper"
  ],
  methodFilters: [
    "makeJP",
    "aroundBody",
    "_findCachedViewById"
  ]
}

let options = {
  filters: filters,
  callback: (_this, args, ret)=>{utils.dumpStackTrace()},
  print: "on"
}

let fn = options["callback"]

function run(){
  // utils._hook("org.aspectj.runtime.reflect.MethodSignatureImpl", "$init", fn)
  // hookAll("com.iherb.app.other.mock.MockActivity", options)
  // hookAll("org.aspectj.runtime.reflect.Factory", options)
  utils._hook("android.os.Bundle", "getString", fn)
  hookAll("com.iherb.mobile.prepay.payment.paymentmethod.view.paymentmethodlist.PaymentMethodListFragment", options)
  // utils._hook("org.aspectj.runtime.reflect.Factory", "makeMethodSig", fn)
  // utils._hook("com.iherb.app.other.mock.MockActivity", "onCreate_aroundBody0", fn)
  // utils._hook("org.aspectj.lang.JoinPoint", "$init", fn)
}

run()

//@ts-expect-error
global.utils = utils
