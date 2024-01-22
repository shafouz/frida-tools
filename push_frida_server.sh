#!/bin/bash

if [ $2 ]; then
  adb push $1 /data/local/tmp/
  adb shell "su -c 'chmod 755 /data/local/tmp/$1 && /data/local/tmp/$1 &'" 
else
  adb root
  adb push $1 /data/local/tmp/
  adb shell "chmod 755 /data/local/tmp/$1"
  adb shell "/data/local/tmp/$1 &"
fi
