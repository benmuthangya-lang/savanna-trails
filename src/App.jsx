import { useState } from 'react'
import AboutSection from './components/AboutSection.jsx'
import EnquirySection from './components/EnquirySection.jsx'
import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import TourSection from './components/TourSection.jsx'

function App() {
  const [selectedTour, setSelectedTour] = useState('')
  const [selectionRequestId, setSelectionRequestId] = useState(0)

  const selectTourForEnquiry = (tourName) => {
    setSelectedTour(tourName)
    // A counter also detects re-selecting the same tour, which would not change selectedTour.
    setSelectionRequestId((current) => current + 1)
    // Wait for React and the hash navigation before focusing the form control.
    window.setTimeout(() => document.getElementById('tour')?.focus({ preventScroll: true }), 0)
  }

  return (
    <div className="site-shell" id="top">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Header />

      <main id="main-content" tabIndex="-1">
        <Hero />

        <section className="intro-strip" aria-label="Portfolio project notice">
          <div className="container intro-grid">
            <p className="eyebrow">A demonstration, clearly labelled</p>
            <p>This website presents fictional tours and sample pricing for portfolio purposes. Savanna Trails is not a real travel operator and does not accept bookings.</p>
          </div>
        </section>

        <TourSection onEnquire={selectTourForEnquiry} />
        <EnquirySection
          selectedTour={selectedTour}
          selectionRequestId={selectionRequestId}
          onTourChange={setSelectedTour}
        />
        <AboutSection />
      </main>

      <Footer />
    </div>
  )
}

export default App
