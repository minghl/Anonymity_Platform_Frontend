import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DatasetProcessingForm from './components/DatasetProcessingForm';
import HierarchyForm from './components/HierarchyForm';
import AnonymityForm from './components/AnonymityForm';

function App() {
  const [file, setFile] = useState(null);  // 将文件状态提升到 App 组件
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DatasetProcessingForm setFile={setFile} file={file}/>} />
        <Route path="/hierarchy" element={<HierarchyForm  file={file} />} />
        <Route path="/anonymity" element={<AnonymityForm   file={file}/>} />
      </Routes>
    </Router>
  );
}

export default App;

