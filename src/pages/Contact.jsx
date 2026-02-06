import { useState } from 'react';

const Contact = () => {
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const text = form.message.value.trim();

    if (name.length < 2) {
      setMessage('Please enter a valid name.');
      setIsError(true);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('Please enter a valid email address.');
      setIsError(true);
      return;
    }
    if (text.length < 10) {
      setMessage('Message should be at least 10 characters.');
      setIsError(true);
      return;
    }

    setMessage('Thank you! Your message has been submitted.');
    setIsError(false);
    form.reset();
  };

  return (
    <main className="section">
      <div className="container contact-grid">
        <section>
          <h1>Contact Us</h1>
          <p>We’d love to hear from you. Send us your message and our team will respond shortly.</p>
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <label htmlFor="name">Name</label>
            <input id="name" name="name" type="text" required />
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required />
            <label htmlFor="message">Message</label>
            <textarea id="message" name="message" rows="5" required />
            <button className="btn btn-primary" type="submit">
              Send Message
            </button>
            <p style={{ color: isError ? 'crimson' : 'green' }}>{message}</p>
          </form>
        </section>
        <aside className="contact-info">
          <h2>Business Info</h2>
          <p>
            <i className="fa-solid fa-envelope" /> hello@bookbasqet.com
          </p>
          <p>
            <i className="fa-solid fa-phone" /> +1 (555) 123-4567
          </p>
          <div className="map-placeholder">Google Maps Placeholder</div>
        </aside>
      </div>
    </main>
  );
};

export default Contact;
