#!/bin/bash

arr=(
  'HwProgressButton'
  'HwTextView'
  'KeyboardHeightUtil'
  'HwSeekableGravitationalLoadingDrawable'
  'HwEventBadgeDrawable'
  'HwSubTabWidget'
  'AwContents'
  'AwSettings'
)
cmd="frida-trace -U -n FusionSolar -j '*huawei*!*/i' -o log.txt"

for word in ${arr[@]}; do
  cmd=$cmd" -J '*"$word"*!*/i'"
done
echo $cmd

eval "$cmd"
