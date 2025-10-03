import React from 'react';
import './Mentions.scss';
import { useNavigate } from 'react-router-dom';


const Mentions: React.FC = () => {
    const navigate = useNavigate();
  return (
    <main className="mentions">
      <section>
        <h1 className='mentions-h1'>Mentions Légales – BlaBlaBook</h1>
        <p className='mentions-update'>Dernière mise à jour : 27 août 2025</p>
      </section>

      <section>
        <h2 className="mentions-h2">1. Éditeur de l'application</h2>
        <p>
          L’application <strong>BlaBlaBook</strong> est un projet fictif réalisé dans un cadre scolaire. Elle n’a aucune vocation commerciale.
        </p>
        <p>
          Équipe de développement :Lucas R, Elodie T, Jonathan R, Stéphane L <br />
          Groupe étudiant – Projet pédagogique <br />
          Nom de l’école : O'Clock
        </p>
      </section>

      <section>
        <h2 className="mentions-h2">2. Responsable de la publication</h2>
        <p>
          Responsable : Équipe BlaBlaBook (projet étudiant)<br />
          Contact : <a className='mail' href="mailto:contact@blablabook.fake">contact@blablabook.fake</a> (adresse fictive)
        </p>
      </section>

      <section>
        <h2 className="mentions-h2">3. Hébergement</h2>
        <p>
          L’application est hébergée à des fins pédagogiques sur une plateforme gratuite :
        </p>
        <p>
          Nom de l’hébergeur : GitHub Pages / Vercel / Netlify (à adapter selon ton cas)<br />
          Adresse du site : [https://blablabook.fake] (adresse fictive)
        </p>
      </section>

      <section>
        <h2 className="mentions-h2">4. Propriété intellectuelle</h2>
        <p>
          Les contenus de cette application (textes, images, interface) ont été réalisés par les étudiants dans un cadre pédagogique.  
          Les informations sur les livres proviennent de l’<strong>API publique OpenLibrary</strong>.
        </p>
      </section>

      <section>
        <h2 className="mentions-h2">5. Responsabilité</h2>
        <p>
          Ce site étant fictif, aucune responsabilité ne peut être engagée concernant l’exactitude ou l’utilisation des données.  
          Les données affichées sont à but démonstratif uniquement.
        </p>
      </section>

      <section>
        <h2 className="mentions-h2">6. Données personnelles</h2>
        <p>
          Aucune donnée personnelle n’est collectée sur BlaBlaBook.  
          Pour en savoir plus, veuillez consulter la <a href="/privacy" onClick={() => navigate(`/Mentions-Legales`)}>Politique de confidentialité</a>.
        </p>
      </section>
    </main>
  );
};

export default Mentions;
