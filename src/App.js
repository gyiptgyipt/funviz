import logo from './logo.svg';
import './App.css';
import { useContext, useEffect, useRef , useState } from "react";
import { RosContext } from "./context/RosContext";
import VirtualJoystick from "./context/VirtualJoystick";
import ROSLIB from 'roslib';
import * as THREE from "three";

function App() {

  const ros = useContext(RosContext);
  // const [tfData, setTfData] = useState([]);
  const [odom, setOdom] = useState([]);
  const [baseFootprint, setBaseFootprint] = useState([]);
  const mountRef = useRef();
  const baseRef = useRef();


  useEffect(() => { //useffect subscribe hook
    // Initialize Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    camera.position.z = 5;

    // Create the material for the lines
    const lineMaterial_red = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const lineMaterial_green = new THREE.LineBasicMaterial({ color: 0x008000 });


    // Define the geometry for the horizontal line
    const horizontalGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0), // Start point
        new THREE.Vector3(0.5, 0, 0),  // End point
    ]);
    const horizontalLine = new THREE.Line(horizontalGeometry, lineMaterial_red);  // အလျားလိုက်

    const horizontalLineOdom = new THREE.Line(horizontalGeometry, lineMaterial_red);  // အလျားလိုက်

    // Define the geometry for the vertical line
    const verticalGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0), // Start point
        new THREE.Vector3(0, 0.5, 0),  // End point
    ]);
    const verticalLine = new THREE.Line(verticalGeometry, lineMaterial_green); //ဒေါင်လိုက်
    const verticalLineOdom = new THREE.Line(verticalGeometry, lineMaterial_green); //ဒေါင်လိုက်

    // Create a group and add both lines
    const odomFrame = new THREE.Group();
    odomFrame.add(horizontalLineOdom);
    odomFrame.add(verticalLineOdom);
    scene.add(odomFrame);

    const baseFootprintFrame = new THREE.Group();
    baseFootprintFrame.add(horizontalLine);
    baseFootprintFrame.add(verticalLine);
    scene.add(baseFootprintFrame);
    
    baseRef.current = baseFootprintFrame
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
    };
  }, []);



  useEffect(() => { //useffect subscribe hook
    if (!ros) return;
  
    const tfListener = new ROSLIB.Topic({
      ros,
      name: "/tf",
      messageType: "tf2_msgs/TFMessage",
    });

    const odomTopic = new ROSLIB.Topic({
      ros: ros,
      name: '/odom', // Topic name
      messageType: 'nav_msgs/Odometry' // Message type for odometry data
    });
  
    tfListener.subscribe((message) => {
      // console.log("TF Data for Visualization:", message);
      // Add TF visualization logic here.
      
    });
    odomTopic.subscribe((message) => {
      // console.log(message);
      setBaseFootprint(message.pose.pose);
      // console.log(baseFootprint)
      // Add TF visualization logic here.
      
    });
  
    return () => {
      tfListener.unsubscribe();
    };
  }, [ros]);

  useEffect(() => {
    // console.log(baseFootprint)
    if (baseFootprint.position){
    const animationFrame = () => {
      if (baseRef.current){
        baseRef.current.position.x = baseFootprint.position.x;
        baseRef.current.position.y = baseFootprint.position.y;
        baseRef.current.position.z = baseFootprint.position.z;
        baseRef.current.rotation.x = baseFootprint.orientation.x;
        baseRef.current.rotation.y = baseFootprint.orientation.y;
        baseRef.current.rotation.z = baseFootprint.orientation.z;
        // console.log(baseRef.current.position.x);
      }
      requestAnimationFrame(animationFrame);
    }
    const animationId = requestAnimationFrame(animationFrame);

    // Cleanup
    return () => cancelAnimationFrame(animationId);
  }
  },[baseFootprint])



  const handleJoystickMove = ({ linear, angular }) => {
    console.log(`Linear: ${linear}, Angular: ${angular}`);
    // Use ROSLIB to send commands to /cmd_vel or other topics here
  };

  const handleJoystickEnd = () => {
    console.log("Joystick released");
    // Stop the robot's movement here
  };


  return (
    <div className="App">
      <div ref={mountRef} style={{ width: "100vw", height: "100vh" }}></div>
      <VirtualJoystick onMove={handleJoystickMove} onEnd={handleJoystickEnd} />
    </div>
  );
}

export default App;
