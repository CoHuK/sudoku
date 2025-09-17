#!/bin/bash

echo "Building Sudoku application..."
docker build -t sudoku-game .

echo "Running Sudoku application..."
docker run -d -p 3000:3000 --name sudoku-container sudoku-game

echo "Application is running at http://localhost:3000"
echo "To stop: docker stop sudoku-container"
echo "To remove: docker rm sudoku-container"