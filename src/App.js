import './App.css';
import { useContext, useEffect, useRef } from "react";

import NavPanel from "./components/NavPanel";
import { RosContext } from "./context/RosContext";
import VirtualJoystick from "./context/VirtualJoystick";
import { LidarContext } from "./context/LidarContext";
import { CameraContext } from "./context/CameraContext";
import { MapProvider, MapContext } from "./context/MapContext";
import { TFContext, TFProvider } from "./context/TFContext";

import * as THREE from "three";

function App() {
  const ros = useContext(RosContext);
  const { lidarData } = useContext(LidarContext);
  const { cameraPosition, startDrag, updateDrag, endDrag, cameraRotation } = useContext(CameraContext);

  const mountRef = useRef();
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);
  const lidarPointsRef = useRef([]);
  const rendererRef = useRef(null);

  const { mapData } = useContext(MapContext);
  const { frameData } = useContext(TFContext);
  const { tfGroupsRef } = useContext(TFContext); // Access TFContext
  const mapMeshRef = useRef(null);

  const camHigh = 8;

  const frameId = "base_footpirnt";

  // Map Visualization Effect
  useEffect(() => {
    if (!mapData || !mapData.info) return;

    const { width, height, resolution } = mapData.info;
    const gridData = mapData.data;

    const mapGeometry = new THREE.PlaneGeometry(width * resolution, height * resolution, width, height);
    const mapMaterial = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });
    const mapMesh = new THREE.Mesh(mapGeometry, mapMaterial);

    const colors = new Float32Array((width + 1) * (height + 1) * 3);
    gridData.forEach((value, index) => {
      let color;
      if (value === -1) {
        color = new THREE.Color(0.5, 0.5, 0.5);
      } else if (value === 0) {
        color = new THREE.Color(1, 1, 1);
      } else {
        color = new THREE.Color(0, 0, 0);
      }
      const i = index * 3;
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    });

    mapGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    mapMesh.position.set(0, 0, 0);                // tf map frame position ထည့်ရန်

    if (mapMeshRef.current) {
      sceneRef.current.remove(mapMeshRef.current);
    }
    sceneRef.current.add(mapMesh);
    mapMeshRef.current = mapMesh;
  }, [mapData]);

  // Scene Initialization
  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x888888);
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraRef.current = camera;
    sceneRef.current = scene;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // camera.position.set(cameraPosition.x, cameraPosition.y, camHigh);

    const gridHelper = new THREE.GridHelper(8, 8, 0x000000, 0x000000);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.set(0, 0, 0);
    scene.add(gridHelper);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    const lidarGeometry = new THREE.BufferGeometry();
    const lidarMaterial = new THREE.PointsMaterial({ color: 0xff0000, size: 0.05 });
    const lidarPoints = new THREE.Points(lidarGeometry, lidarMaterial);
    scene.add(lidarPoints);
    lidarPointsRef.current = lidarGeometry;

    console.log(frameData);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
      camera.position.set(cameraPosition.x, cameraPosition.y, camHigh);
      camera.rotation.set(0, 0, cameraRotation.x);
    }
  }, [cameraPosition, cameraRotation]);

  useEffect(() => {
    
    const interval = setInterval(() => {
      const group = tfGroupsRef.current[frameId];

      if (group) {
        console.log(tfGroupsRef);
        console.log(`Frame: ${frameId}`);
        console.log("Position:", group.position);
        console.log("Rotation (Quaternion):", group.quaternion);
      } else {
        console.log(`Frame '${frameId}' not found.`);
      }
    }, 1000); // Check every 1 second

    return () => clearInterval(interval);
  }, [frameId, tfGroupsRef]);

  const handleJoystickMove = ({ linear, angular }) => {
    console.log(`Linear: ${linear}, Angular: ${angular}`);
  };

  const handleJoystickEnd = () => {
    console.log("Joystick released");
  };

  return (
    <TFProvider ros={ros} sceneRef={sceneRef} cameraRef={cameraRef}>
      <div
        className="App"
        onMouseDown={startDrag}
        onMouseMove={updateDrag}
        onMouseUp={endDrag}
      >
        <NavPanel />
        <div ref={mountRef} style={{ width: "100vw", height: "100vh" }}></div>
        <VirtualJoystick onMove={handleJoystickMove} onEnd={handleJoystickEnd} />
      </div>
    </TFProvider>
  );
};

export default App;
