import React from "react";
import ReactDOM from 'react-dom/client';
import App from "./App";
import { RosProvider } from "./context/RosContext";
import { LidarProvider } from "./context/LidarContext";
import { CameraProvider } from "./context/CameraContext";
import { TFProvider , TFContext } from "./context/TFContext";
import { MapProvider } from './context/MapContext';

import { BrowserRouter } from "react-router-dom"; //navpanel

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <RosProvider>
    <BrowserRouter>
    <TFProvider>
      <LidarProvider>
      <CameraProvider>
        <MapProvider>
          
      
    <App />
      
      </MapProvider>
      </CameraProvider>
      </LidarProvider>
      </TFProvider>
    </BrowserRouter>
  </RosProvider>
);
