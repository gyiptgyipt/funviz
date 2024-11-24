import React from "react";
import ReactDOM from 'react-dom/client';
import App from "./App";
import { RosProvider } from "./context/RosContext";
import { LidarProvider } from "./context/LidarContext";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <RosProvider>
      <LidarProvider>
    <App />
      </LidarProvider>
  </RosProvider>
);
