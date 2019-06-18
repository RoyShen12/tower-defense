start npx babel --no-comments --plugins @babel/plugin-proposal-class-properties,@babel/plugin-transform-classes,@babel/plugin-proposal-object-rest-spread,@babel/plugin-transform-async-to-generator,@babel/plugin-proposal-private-methods ./*.js -d babel-dist
start xcopy "img" "babel-dist\img" /y /s
start xcopy "index.html" "babel-dist" /y
start xcopy "global.css" "babel-dist" /y