import React from 'react';
import { BookingWizard } from '../BookingWizard/BookingWizard';

/**
 * ContactForm has been upgraded to the Full Appointment Booking Wizard.
 * Renders the state-of-the-art conflict-free live availability booking system.
 */
const ContactForm = ({ defaultService = '', className = '' }) => {
  return <BookingWizard defaultService={defaultService} className={className} />;
};

export default ContactForm;
