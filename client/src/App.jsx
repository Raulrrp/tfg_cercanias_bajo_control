import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext.jsx';
import Map from './pages/Map.jsx';
import Analysis from './pages/Analysis.jsx';

function App() {
  return (
    // when refreshing don't go back to / and 
    // you can go back using browser back arrows
    // you can share the url directly to the analysis page
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Map />} />
          <Route path="/analysis" element={<Analysis />} />
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;