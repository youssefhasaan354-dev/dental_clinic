import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import Banner from '../sections/Banner/Banner';
import TrustStrip from '../sections/TrustStrip/TrustStrip';
import Services from '../sections/Services/Services';
import Emergency from '../sections/Emergency/Emergency';
import Features from '../sections/Features/Features';
import Expert from '../sections/Expert/Expert';
import ProcessTimeline from '../components/ProcessTimeline/ProcessTimeline';
import Team from '../sections/Team/Team';
import RatingShowcase from '../components/RatingShowcase/RatingShowcase';
import Gallery from '../sections/Gallery/Gallery';
import Blogs from '../sections/Blogs/Blogs';
import Faq from '../sections/Faq/Faq';
import Appointment from '../sections/Appointment/Appointment';
import Footer from '../components/Footer/Footer';
import FloatingActions from '../components/FloatingActions/FloatingActions';
import ScrollProgress from '../components/ScrollProgress/ScrollProgress';

const Home = () => {
  return (
    <main id="main-content" className="home-page-layout">
      <ScrollProgress />
      <Navbar />
      <Banner />
      <TrustStrip />
      <Services limit={8} showAllBtn={true} />
      <Emergency />
      <Features />
      <Expert />
      <ProcessTimeline />
      <Team />
      <RatingShowcase />
      <Gallery />
      <Blogs limit={3} showAllBtn={true} />
      <Faq limit={6} />
      <Appointment />
      <Footer />
      <FloatingActions />
    </main>
  );
};

export default Home;
