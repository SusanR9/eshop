import Navbar from './components/Navbar';
import AppRoutes from './routes';

function App() {
  return (
    <>
      <Navbar />
      <main style={{ padding: '1rem' }}>
        <AppRoutes />
      </main>
    </>
  );
}

export default App;
