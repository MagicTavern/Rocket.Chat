#!/bin/bash

rm -rf ~/Downloads/rocket.chat.build/bundle
meteor build --directory ~/Downloads/rocket.chat.build/ --server-only --architecture os.linux.x86_64

