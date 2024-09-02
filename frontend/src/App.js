import React from 'react';
import LayoutApp from './layout'
import { Route, Routes } from 'react-router-dom'
import Charts from './pages/charts';
import Main from './pages/main';

function App() {

  return (
    <LayoutApp>
      <Routes>
        <Route path='/' element={<Main />} />
        <Route path='/powerStream' element={<Main />} />
        <Route path="/charts" element={<Charts />} />
      </Routes>      
    </LayoutApp>      
  );
}

export default App;
