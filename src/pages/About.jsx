import React from 'react';
import Navbar from '../components/Navbar/Navbar';
import AboutBanner from '../sections/AboutBanner/AboutBanner';
import Priority from '../sections/Priority/Priority';
import Safety from '../sections/Safety/Safety';
import Team from '../sections/Team/Team';
import Faq from '../sections/Faq/Faq';
import Appointment from '../sections/Appointment/Appointment';
import Footer from '../components/Footer/Footer';
import FloatingActions from '../components/FloatingActions/FloatingActions';
import ScrollProgress from '../components/ScrollProgress/ScrollProgress';

const About = () => {
  return (
    <main id="main-content" className="about-page-layout">
      <ScrollProgress />
      <Navbar />
      <AboutBanner />
      <Priority />
      <Safety />
      <Team />
      <Faq limit={6} />
      <Appointment />
      <Footer />
      <FloatingActions />
    </main>
  );
};

export default About;
