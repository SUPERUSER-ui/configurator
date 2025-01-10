import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { VoiceAssistant } from './components/VoiceAssistant';
import { Home } from './pages/Home';
import { VehicleBuilder } from './pages/VehicleBuilder';
import { VehicleCustomizer } from './pages/VehicleCustomizer';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/build/:vehicleId" element={<VehicleBuilder />} />
        <Route path="/build/:vehicleId/:modelId/customize" element={<VehicleCustomizer />} />
      </Routes>
      <VoiceAssistant />
    </div>
  );
}

export default App;