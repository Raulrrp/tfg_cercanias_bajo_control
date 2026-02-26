import Sidebar from '../components/Sidebar';
import MapView from '../components/MapView';

const Home = () => {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      <Sidebar />
      <div style={{ flex: 1, position: 'relative' }}>
        <MapView />
      </div>
    </div>
  );
};

export default Home;