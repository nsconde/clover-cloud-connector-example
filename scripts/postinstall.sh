#!/usr/bin/env bash
browserify -t [ babelify --presets [ react ]  ] public/example-react-src.js -o public/example-react.js
