import Header from '../components/Header';
import MainContent from '../components/MainContent';
import RegulationsTable from '../components/RegulationsTable';
import Footer from '../components/Footer';

export function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1 container py-4">
        <MainContent />
        <RegulationsTable />
      </main>
      <Footer />
    </div>
  );
}

export default App;
