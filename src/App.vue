<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <HelloWorld msg="Welcome to Your Vue.js App"/>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue';
import ROSLIB from "roslib";


export default {
  components:{HelloWorld},
  data() {
    return {
      ros: null,
      connected: false,
    };
  },
  methods: {
    connectToROS() {
      // Replace with your ROSBridge WebSocket URL
      const rosbridgeUrl = "ws://localhost:9090";

      this.ros = new ROSLIB.Ros({
        url: rosbridgeUrl,
      });

      this.ros.on("connection", () => {
        console.log("Connected to ROSBridge!");
        this.connected = true;
      });

      // add custom
      this.topicSubscriber = new ROSLIB.Topic({
        ros: this.ros,
        name: "/scan", // ROS topic name
        messageType: "sensor_msgs/msg/LaserScan", // ROS message type (adjust to your topic's type)
      });

      // Subscribe to the topic
      this.topicSubscriber.subscribe((message) => {
        console.log("Received message on /your_topic_name:", message);
        this.topicMessage = message.data; // Update the UI or process the data
      });

      this.ros.on("error", (error) => {
        console.error("Connection error:", error);
      });

      this.ros.on("close", () => {
        console.log("Connection to ROSBridge closed.");
        this.connected = false;
      });
    },
  },
  mounted() {
    this.connectToROS();
  },
};


</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
