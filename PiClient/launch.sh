#!/bin/bash
url=`youtube-dl -g $1`
SAVEIFS=$IFS
IFS=$'\n'
url=($url)
IFS=$SAVEIFS
echo ${url[1]}
