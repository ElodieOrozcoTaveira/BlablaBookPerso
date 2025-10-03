import React from 'react';
import './Apropos.scss'; 


const About: React.FC = () => {
  return (
    <main className="about-page">
      <section>
        <h1 className='about-h1' >À propos de BlaBlaBook</h1>
        <p className='update'>Dernière mise à jour : 27 août 2025</p>
      </section>

      <section>
        <h2 className='about-h2'>Objectif du projet</h2>
        <p>
          <strong>BlaBlaBook</strong> est une application fictive développée dans le cadre d’un projet scolaire.  
          Elle a pour but de simuler une plateforme de gestion de bibliothèque numérique, permettant la recherche et la consultation de livres via l’API publique <a href="https://openlibrary.org" target="_blank" rel="noopener noreferrer"><strong>OpenLibrary</strong></a>.
        </p>
      </section>

      <section>
        <h2 className='about-h2'>Contexte pédagogique</h2>
        <p>
          Ce projet a été réalisé dans le cadre du cours de développement web avec l'école O'Clock.  
          Il vise à mettre en pratique les compétences suivantes :
        </p>
        <ul className='about-ul'>
          <li>Développement en React (TypeScript)</li>
          <li>Utilisation d'API externes</li>
          <li>Organisation d'un projet en équipe</li>
          <li>Application des bonnes pratiques UX/UI</li>
        </ul>
      </section>

      <section>
        <h2 className='about-h2'>Équipe projet</h2>
        <ul className='about-ul'>
          <li>Lucas R – Développeur Frontend / LeadDev</li>
          <li>Elodie T – Développeuse FrontEnd / ScrumMaster</li>
          <li>Jonathan R – Développeur BackEnd / DevOps</li>
          <li>Stéphane L – Développeur BackEnd / DevSec</li>
        </ul>
      </section>

      <section>
        <h2 className='about-h2'>Technologies utilisées</h2>
        <ul className='about-ul'>
          <li>React + TypeScript</li>
          <li>SCSS (modulaire)</li>
          <li>API OpenLibrary</li>
          <li>Hébergement : Vercel / Netlify / GitHub Pages (selon votre cas)</li>
        </ul>
      </section>

      <section>
        <h2 className='about-h2'>Remarque</h2>
        <p>
          BlaBlaBook est un projet purement fictif.  
          Il ne collecte aucune donnée personnelle, ne stocke rien, et ne propose aucune fonction commerciale.
        </p>
      </section>

      <section>
        <h2 className='about-h2'>Contact</h2>
        <p>
          Pour toute question liée au projet :  
          <a className='mail' href="mailto:contact@blablabook.fake">contact@blablabook.fake</a> (adresse fictive)
        </p>
      </section>
    </main>
  );
};

export default About;
