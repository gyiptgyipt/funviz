import React, { createContext, useEffect, useRef } from "react";
import ROSLIB from "roslib";
import * as THREE from "three";

// export const TFContext = createContext();
export const TFContext = createContext();


export const TFProvider = ({ ros, sceneRef, cameraRef, children }) => {
  const tfGroupsRef = useRef({});  // Ensure it's initialized as an empty object

  useEffect(() => {
    if (!ros) return;

    // Dynamic transform listener
    const tfListener = new ROSLIB.Topic({
      ros,
      name: "/tf",
      messageType: "tf2_msgs/TFMessage",
    });

    tfListener.subscribe((message) => {
      console.log("Received /tf message:", message); // Log the message to check if it's coming through

      message.transforms.forEach((transform) => {
        const { translation, rotation } = transform.transform;
        const { child_frame_id } = transform;

        // Add or update the tfGroupsRef object
        if (!tfGroupsRef.current[child_frame_id]) {
          const group = new THREE.Group();
          tfGroupsRef.current[child_frame_id] = group;
          console.log(`Added new group for frame: ${child_frame_id}`);
        }

        const group = tfGroupsRef.current[child_frame_id];
        if (group) {
          group.position.set(translation.x, translation.y, translation.z);
          group.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
          console.log(`Updated group for frame: ${child_frame_id}`, group);
        }
      });
    });

    // Static transform listener (optional)
    const tfStaticListener = new ROSLIB.Topic({
      ros,
      name: "/tf_static",
      messageType: "tf2_msgs/TFMessage",
    });

    tfStaticListener.subscribe((message) => {
      console.log("Received /tf_static message:", message); // Log the message

      message.transforms.forEach((transform) => {
        const { translation, rotation } = transform.transform;
        const { child_frame_id } = transform;

        // Add or update the tfGroupsRef object for static transforms
        if (!tfGroupsRef.current[child_frame_id]) {
          const group = new THREE.Group();
          tfGroupsRef.current[child_frame_id] = group;
          console.log(`Added static group for frame: ${child_frame_id}`);
        }

        const group = tfGroupsRef.current[child_frame_id];
        if (group) {
          group.position.set(translation.x, translation.y, translation.z);
          group.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
          console.log(`Updated static group for frame: ${child_frame_id}`, group);
        }
      });
    });

    return () => {
      tfListener.unsubscribe();
      tfStaticListener.unsubscribe();
    };
  }, [ros]);

  return (
    <TFContext.Provider value={{ tfGroupsRef }}>
      {children}
    </TFContext.Provider>
  );
};


