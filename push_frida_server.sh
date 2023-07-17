#!/bin/bash

if [ $2 ]; then
  adb push $1 /data/local/tmp/
  adb shell "su -c 'chmod 755 /data/local/tmp/$1 && /data/local/tmp/$1 &'" 
else
  adb -s 127.0.0.1:5555 root
  adb -s 127.0.0.1:5555 push $1 /data/local/tmp/
  adb -s 127.0.0.1:5555 shell "chmod 755 /data/local/tmp/$1"
  adb -s 127.0.0.1:5555 shell "/data/local/tmp/$1 &"
fi
