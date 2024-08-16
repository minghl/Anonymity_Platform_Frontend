import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DatasetProcessingForm from './components/DatasetProcessingForm';
import HierarchyForm from './components/HierarchyForm';
import AnonymityForm from './components/AnonymityForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DatasetProcessingForm />} />
        <Route path="/hierarchy" element={<HierarchyForm />} />
        <Route path="/anonymity" element={<AnonymityForm />} />
      </Routes>
    </Router>
  );
}

export default App;

