#!/bin/bash
echo "WARNING - Make sure you have \"output\": \"standalone\" in the next.config.mjs file..."
echo "Building Next project..."
npx next build

echo "Copying directories..."
cp -rf public .next/standalone/
cp -rf .next/static .next/standalone/.next/

echo "Build done. Run \"HOSTNAME=127.0.0.1 PORT=3000 NODE_ENV=production node .next/standalone/server.js\" to run website."