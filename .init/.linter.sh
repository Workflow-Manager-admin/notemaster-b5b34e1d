#!/bin/bash
cd /home/kavia/workspace/code-generation/notemaster-b5b34e1d/notes_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

