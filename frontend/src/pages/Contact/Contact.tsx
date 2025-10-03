import React from 'react';
import './Contact.scss';

const Contact: React.FC = () => {
  return (
    <main className="contact-page">
      <section>
        <h1 className='contact-h1'>Contact – BlaBlaBook</h1>
        <p className='update'>Dernière mise à jour : 27 août 2025</p>
      </section>

      <section className="contact-info">
        <h2 className='contact-h2'>Formulaire de contact</h2>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            alert('Message envoyé (simulation)');
          }}
        >
          <label htmlFor="name">Nom :</label>
          <input className='contact-input' type="text" id="name" name="name" required />

          <label htmlFor="email">Email :</label>
          <input type="email" id="email" name="email" required />

          <label htmlFor="message">Message :</label>
          <textarea id="message" name="message" rows={5} required />

          <button className='contact-btn' type="submit">Envoyer</button>
        </form>

      <section className="contact-map">
        <h2 className='contact-h2-map'>Où sommes-nous ?</h2>
        <p className='contact-adress'>Adresse fictive : 123 Rue des Livres, 75000 Paris</p>
        <div className="map-container">
          <iframe
            title="Google Map BlaBlaBook"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.999996619246!2d2.2922926156733626!3d48.85884460869826!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66fdfd5dbd35f%3A0xdee7d572d6dfd742!2sTour%20Eiffel!5e0!3m2!1sfr!2sfr!4v1690836032489!5m2!1sfr!2sfr"
            width="100%"
            height="300"
            allowFullScreen
            loading="lazy"
            ></iframe>
        </div>
      </section>
     </section>
    </main>
  );
};

export default Contact;
