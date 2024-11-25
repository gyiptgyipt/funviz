import React, { useEffect, useRef } from "react";
import nipplejs from "nipplejs";
import ROSLIB from "roslib";

const VirtualJoystick = ({ rosUrl = "ws://localhost:9090" }) => {
  const joystickRef = useRef();
  const ros = useRef(null);
  const cmdVelTopic = useRef(null);

  useEffect(() => {
    // Initialize ROS connection
    ros.current = new ROSLIB.Ros({ url: rosUrl });

    // Set up the cmd_vel topic publisher
    cmdVelTopic.current = new ROSLIB.Topic({
      ros: ros.current,
      name: "/cmd_vel",
      messageType: "geometry_msgs/Twist",
    });

    return () => {
      // Clean up ROS connection
      ros.current.close();
    };
  }, [rosUrl]);

  useEffect(() => {
    const joystick = nipplejs.create({
      zone: joystickRef.current, // Attach to the container
      mode: "static",
      position: { left: "50px", bottom: "50px" }, // Position on screen
      color: "blue",
    });

    // Event listeners for joystick
    joystick.on("move", (evt, data) => {
      if (data.vector) {
        const linear = parseFloat(data.vector.x.toFixed(2)); // Forward/Backward
        const angular = parseFloat(data.vector.y.toFixed(2)); // Left/Right

        // Create and publish the Twist message
        const twist = new ROSLIB.Message({
          linear: { x: linear, y: 0, z: 0 },
          angular: { x: 0, y: 0, z: angular },
        });
        cmdVelTopic.current.publish(twist);
      }
    });

    joystick.on("end", () => {
      // Stop the robot by publishing zero velocity
      const twist = new ROSLIB.Message({
        linear: { x: 0, y: 0, z: 0 },
        angular: { x: 0, y: 0, z: 0 },
      });
      cmdVelTopic.current.publish(twist);
    });

    return () => {
      joystick.destroy(); // Cleanup on unmount
    };
  }, []);

  return (
    <div
      ref={joystickRef}
      style={{
        position: "absolute",
        bottom: "40px",
        left: "40px",
        width: "300px",
        height: "300px",
      }}
    ></div>
  );
};

export default VirtualJoystick;
