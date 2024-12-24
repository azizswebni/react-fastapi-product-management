#!/bin/bash

set -e  # Exit on error

echo "Starting the web application..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000