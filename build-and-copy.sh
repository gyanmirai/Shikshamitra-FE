#!/bin/bash

# Exit the script on any error
set -e

# Install npm packages
echo "Installing npm packages..."
npm install

# Check if npm install was successful
if [ $? -ne 0 ]; then
    echo "npm install failed, exiting..."
    exit 1
fi

# Run the build process
echo "Building the project..."
npm run build

# Check if the build was successful
if [ $? -ne 0 ]; then
    echo "Build process failed, exiting..."
    exit 1
fi

# Check if the destination directory exists, if not, create it
if [ ! -d "./build/standalone/build" ]; then
    echo "Creating build/standalone/build directory..."
    mkdir -p "./build/standalone/build"
fi

# Copy the static folder (macOS/Linux)
echo "Copying the static folder..."
cp -r "./build/static" "./build/standalone/build"

# Check if the standalone directory exists, if not, create it
if [ ! -d "./build/standalone" ]; then
    echo "Creating build/standalone directory..."
    mkdir -p "./build/standalone"
fi

# Copy the public folder (macOS/Linux)
echo "Copying the public folder..."
cp -r "./public" "./build/standalone"

echo "Script executed successfully!"
