#! /bin/sh

rsync --quiet --archive --delete -e "ssh -i $1" $2 jlacroix@$3:$2