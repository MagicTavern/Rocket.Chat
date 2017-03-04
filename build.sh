#!/bin/bash

rm -rf ~/Downloads/rocket.chat.build/bundle
rm -rf .meteor/local/isopacks
meteor build --headless --directory ~/Downloads/rocket.chat.build/ --server-only --architecture os.linux.x86_64 "$@"

