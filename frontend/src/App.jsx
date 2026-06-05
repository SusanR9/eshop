import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './routes';

function App() {
  return (
    <>
      <Navbar />
      <main style={{ padding: '1rem' }}>
        <AppRoutes />
      </main>
      <Footer />
    </>
  );
}

export default App;
