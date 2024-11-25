import './App.css';
import { useContext, useEffect, useRef } from "react";
import { RosContext } from "./context/RosContext";
import VirtualJoystick from "./context/VirtualJoystick";
import { LidarContext } from "./context/LidarContext";
import { CameraContext } from "./context/CameraContext";
import ROSLIB from 'roslib';
import * as THREE from "three";

function App() {
  const ros = useContext(RosContext);
  const { lidarData } = useContext(LidarContext);
  const { cameraPosition, startDrag, updateDrag, endDrag } = useContext(CameraContext);

  const mountRef = useRef();
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);
  const tfGroupsRef = useRef({});
  const lidarPointsRef = useRef([]);
  const rendererRef = useRef(null);

  const camhigh = 8;

  useEffect(() => {
    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x888888);
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraRef.current = camera;
    sceneRef.current = scene;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Initial camera position
    camera.position.set(cameraPosition.x, cameraPosition.y, camhigh); // Camera position

    // Add grid helper to the scene
    // const gridHelper = new THREE.GridHelper(8, 8, 0x444444, 0x888888); // 8x8 grid with 1m cells
    // gridHelper.position.set(0, 0, 0); // Center grid at origin
    // scene.add(gridHelper);

    // Add grid helper to the scene
    const gridHelper = new THREE.GridHelper(8, 8, 0x000000, 0x000000); // 8x8 grid with 1m cells, black grid color
    gridHelper.rotation.x = Math.PI / 2; // Rotate grid to lie flat on the X-Y plane
    gridHelper.position.set(0, 0, 0); // Center grid at origin
    scene.add(gridHelper);

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Lidar visualization
    const lidarGeometry = new THREE.BufferGeometry();
    const lidarMaterial = new THREE.PointsMaterial({ color: 0xff0000, size: 0.05 });
    const lidarPoints = new THREE.Points(lidarGeometry, lidarMaterial);
    scene.add(lidarPoints);
    lidarPointsRef.current = lidarGeometry;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Animate TF groups
      Object.values(tfGroupsRef.current).forEach((group) => {
        group.updateMatrixWorld(); // Ensure updates propagate to the scene graph
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!ros) return;
  
    const tfListener = new ROSLIB.Topic({
      ros,
      name: "/tf",
      messageType: "tf2_msgs/TFMessage",
    });
  
    let baseFootprintTransform = null;
  
    tfListener.subscribe((message) => {
      message.transforms.forEach((transform) => {
        const { translation, rotation } = transform.transform;
        const { child_frame_id } = transform;
  
        if (child_frame_id === "base_footprint") {
          baseFootprintTransform = {
            position: translation,
            rotation: new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w),
          };
        }
  
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
  
          sceneRef.current.add(group);
        }
  
        const group = tfGroupsRef.current[child_frame_id];
        if (group) {
          group.position.set(translation.x, translation.y, translation.z);
          group.rotation.setFromQuaternion(
            new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w)
          );
        }
      });
    });
  
    const animate = () => {
      requestAnimationFrame(animate);
  
      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;
  
      if (renderer && scene && camera) {
        const baseFootprintGroup = tfGroupsRef.current["base_footprint"];
        if (baseFootprintGroup && baseFootprintTransform) {
          baseFootprintGroup.position.set(
            baseFootprintTransform.position.x,
            baseFootprintTransform.position.y,
            baseFootprintTransform.position.z
          );
          baseFootprintGroup.setRotationFromQuaternion(baseFootprintTransform.rotation);
        }
  
        renderer.render(scene, camera);
      }
    };
    animate();
  
    return () => {
      tfListener.unsubscribe();
    };
  }, [ros]);

  useEffect(() => {
    if (lidarPointsRef.current && lidarData.length > 0) {
      const positions = new Float32Array(lidarData.flatMap((point) => [point.x, point.y, point.z]));
      lidarPointsRef.current.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
      );
      lidarPointsRef.current.computeBoundingSphere();
    }
  }, [lidarData]);

  useEffect(() => {
    const camera = cameraRef.current;
    if (camera) {
      camera.position.set(cameraPosition.x, cameraPosition.y, camhigh);
    }
  }, [cameraPosition]);

  const handleJoystickMove = ({ linear, angular }) => {
    console.log(`Linear: ${linear}, Angular: ${angular}`);
  };

  const handleJoystickEnd = () => {
    console.log("Joystick released");
  };

  return (
    <div
      className="App"
      onMouseDown={startDrag}
      onMouseMove={updateDrag}
      onMouseUp={endDrag}
    >
      <div ref={mountRef} style={{ width: "100vw", height: "100vh" }}></div>
      <VirtualJoystick onMove={handleJoystickMove} onEnd={handleJoystickEnd} />
    </div>
  );
}

export default App;
