# funviz

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


# For running rosbridge_server 

```
ros2 launch rosbridge_server rosbridge_websocket_launch.xml port:=9090 websocket_options:="--cors *"
```
