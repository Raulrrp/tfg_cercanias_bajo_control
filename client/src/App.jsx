import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from './context/DataContext.jsx';
import Home from './pages/Home.jsx';
import Analysis from './pages/Analysis.jsx';

function App() {
  return (
    // when refreshing don't go back to / and 
    // you can go back using browser back arrows
    // you can share the url directly to the analysis page
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analysis" element={<Analysis />} />
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;