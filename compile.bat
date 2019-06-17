npx babel --plugins @babel/plugin-proposal-class-properties,@babel/plugin-transform-classes,@babel/plugin-proposal-object-rest-spread,@babel/plugin-transform-async-to-generator,@babel/plugin-proposal-private-methods ./*.js -d babel-dist
xcopy "img" "babel-dist\img" /y /s
xcopy "index.html" "babel-dist" /y
xcopy "global.css" "babel-dist" /y