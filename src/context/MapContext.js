import React, { createContext, useContext, useState, useEffect } from "react";
import ROSLIB from "roslib";
import { RosContext } from "./RosContext"; // Ensure RosContext is correctly imported

export const MapContext = createContext(); // Create and export the context

export const MapProvider = ({ children }) => {
  const ros = useContext(RosContext); // Get the ROS connection from RosContext
  const [mapData, setMapData] = useState(null);

  useEffect(() => {
    if (!ros) return;

    const mapTopic = new ROSLIB.Topic({
      ros,
      name: "/map",
      messageType: "nav_msgs/msg/OccupancyGrid",
    });

    mapTopic.subscribe((message) => {
      setMapData(message);
      
    });

    console.log(mapData);                                           // map data getter setter error
    return () => {
      mapTopic.unsubscribe();
    };
  }, [ros]);

  return (
    <MapContext.Provider value={{ mapData }}>
      {children}
    </MapContext.Provider>
  );
};
