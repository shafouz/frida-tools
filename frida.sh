#!/bin/bash

$(adb shell "/data/local/tmp/$1 &")
$(adb shell settings put global http_proxy 192.168.15.51:8080)
frida --codeshare akabe1/frida-multiple-unpinning -U -f $2
