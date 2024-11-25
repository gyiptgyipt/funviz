import React, { createContext, useState, useRef } from "react";

export const CameraContext = createContext();

export const CameraProvider = ({ children }) => {
  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0, z: 2 });
  const isDragging = useRef(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });

  const startDrag = (event) => {
    isDragging.current = true;
    lastMousePosition.current = { x: event.clientX, y: event.clientY };
  };

  const updateDrag = (event) => {
    if (!isDragging.current) return;

    const deltaX = event.clientX - lastMousePosition.current.x;
    const deltaY = event.clientY - lastMousePosition.current.y;

    lastMousePosition.current = { x: event.clientX, y: event.clientY };

    // Reverse the drag direction for camera movement
    setCameraPosition((prev) => ({
      x: prev.x - deltaX * 0.01, // Reverse X direction
      y: prev.y + deltaY * 0.01, // Reverse Y direction
      z: prev.z,
    }));
  };

  const endDrag = () => {
    isDragging.current = false;
  };

  return (
    <CameraContext.Provider
      value={{ cameraPosition, setCameraPosition, startDrag, updateDrag, endDrag }}
    >
      {children}
    </CameraContext.Provider>
  );
};
