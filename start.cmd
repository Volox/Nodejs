@echo off

rem Starting coffee script compile
start /Dpublic\scripts\ coffee -o ./ -cw ./coffee/

rem Starting debugger
start node-inspector
start chrome localhost:8080/debug?port=5858

rem Starting node project compiler
start /D. nodemon --debug app.js