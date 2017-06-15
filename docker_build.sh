#!/bin/bash

IMAGE='lapp-dvde004:5000/automation'

docker build -t $IMAGE:$(cat version.txt) .

echo "Now: docker push $IMAGE:$(cat version.txt)"
