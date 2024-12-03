import React, { createContext, useEffect, useRef, useCallback } from "react";
import ROSLIB from "roslib";
import * as THREE from "three";

export const TFContext = createContext();

export const TFProvider = ({ ros, sceneRef, cameraRef, children }) => {
  const tfGroupsRef = useRef({});

  useEffect(() => {
    if (!ros) return;

    // Dynamic transform listener
    const tfListener = new ROSLIB.Topic({
      ros,
      name: "/tf",
      messageType: "tf2_msgs/TFMessage",
    });

    tfListener.subscribe((message) => {
      message.transforms.forEach((transform) => {
        const { translation, rotation } = transform.transform;
        const { child_frame_id } = transform;


        // Manage TF groups in the scene
        if (!tfGroupsRef.current[child_frame_id]) {
          const group = new THREE.Group();
          tfGroupsRef.current[child_frame_id] = group;

          // Add visual indicators
          const horizontalLine = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(0, 0, 0),
              new THREE.Vector3(0.3, 0, 0),
            ]),
            new THREE.LineBasicMaterial({ color: 0xff0000 })
          );
          const verticalLine = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(0, 0, 0),
              new THREE.Vector3(0, 0.3, 0),
            ]),
            new THREE.LineBasicMaterial({ color: 0x00ff00 })
          );

          group.add(horizontalLine);
          group.add(verticalLine);

          if (sceneRef.current) {
            sceneRef.current.add(group);
          }
        }

        // Update TF group position and rotation
        const group = tfGroupsRef.current[child_frame_id];
        if (group) {
          group.position.set(translation.x, translation.y, translation.z);
          group.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
        }
      });
    });

    // Static transform listener
    const tfStaticListener = new ROSLIB.Topic({
      ros,
      name: "/tf_static",
      messageType: "tf2_msgs/TFMessage",
    });

    tfStaticListener.subscribe((message) => {
      message.transforms.forEach((transform) => {
        const { translation, rotation } = transform.transform;
        const { child_frame_id } = transform;

        // Manage TF groups in the scene
        if (!tfGroupsRef.current[child_frame_id]) {
          const group = new THREE.Group();
          tfGroupsRef.current[child_frame_id] = group;

          const horizontalLine = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(0, 0, 0),
              new THREE.Vector3(0.3, 0, 0),
            ]),
            new THREE.LineBasicMaterial({ color: 0xff0000 })
          );
          const verticalLine = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(0, 0, 0),
              new THREE.Vector3(0, 0.3, 0),
            ]),
            new THREE.LineBasicMaterial({ color: 0x00ff00 })
          );

          group.add(horizontalLine);
          group.add(verticalLine);

          if (sceneRef.current) {
            sceneRef.current.add(group);
          }
        }

        // Update TF group position and rotation
        const group = tfGroupsRef.current[child_frame_id];
        if (group) {
          group.position.set(translation.x, translation.y, translation.z);
          group.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
        }

        const tf_test = getTFFrameData("base_footprint");
        console.log(tf_test);
      });
    });

    return () => {
      tfListener.unsubscribe();
      tfStaticListener.unsubscribe();
    };
  }, [ros]);

  // Function to get specific TF frame data
  const getTFFrameData = useCallback(
    (frameId) => {
      const frame = tfGroupsRef.current[frameId];
      if (frame) {
        return {
          position: frame.position,
          quaternion: frame.quaternion,
        };
      }
      return null;
    },
    [tfGroupsRef]
  );

  return (
    <TFContext.Provider value={{ tfGroupsRef, getTFFrameData }}>
      {children}
    </TFContext.Provider>
  );
};
