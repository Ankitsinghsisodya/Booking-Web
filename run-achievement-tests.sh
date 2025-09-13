#!/bin/bash

# Script to run achievement system tests

echo "🧪 Running Achievement System Tests"
echo "=================================="

# Move to the backend directory
cd "$(dirname "$0")/Backend"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

# Run the test script
echo "Starting tests..."
node test-achievements.js

# Check the exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Test script completed."
    echo "📝 Please check the output above for detailed results."
    echo ""
    echo "Next step: Test the frontend component at /test/achievements"
else
    echo ""
    echo "❌ Test script failed with an error."
    echo "Please check the output above for more details."
fi
