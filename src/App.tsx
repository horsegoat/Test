import Hero from './components/Hero';
import AIDiagnosis from './components/Disease Diagnosis';
import DoctorSection from './components/DoctorSection';
import MedicineShop from './components/MedicineShop';
import ContactUs from './components/ContactUs';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-white">
        <section id="home">
          <Hero />
        </section>
        <section id="diagnosis">
          <AIDiagnosis />
        </section>
        <section id="doctors">
          <DoctorSection />
        </section>
        <section id="shop">
          <MedicineShop />
        </section>
        <section id="contact">
          <ContactUs />
        </section>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
