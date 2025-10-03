import React from 'react';
import './Support.scss';



const Support: React.FC = () => {
  return (
    <main className="support-page">
      <section>
        <h1 className='support-h1' >Support – BlaBlaBook</h1>
        <p className='update'>Dernière mise à jour : 27 août 2025</p>
      </section>

      <section>
        <h2 className="support-h2">Un souci ? Une question ?</h2>
        <p>
          BlaBlaBook est un projet fictif développé par des étudiants dans le cadre d’un travail pédagogique.
          Aucun support technique officiel n’est proposé.
        </p>
        <p>
          Si vous avez une question à propos de l’application, vous pouvez nous écrire à l’adresse suivante :
        </p>
        <p>
          📧 <a className='mail' href="mailto:support@blablabook.fake">support@blablabook.fake</a> (adresse fictive)
        </p>
      </section>

      <section>
        <h2 className="support-h2">Fonctionnement de l'application</h2>
        <p>
          BlaBlaBook permet la consultation d'une bibliothèque virtuelle grâce à l’API publique OpenLibrary.  
          Les données (titres, auteurs, images de couverture) sont fournies par ce service externe.
        </p>
      </section>

      <section>
        <h2 className="support-h2">Limitations</h2>
        <ul>
          <li>Ce site est un prototype, il peut comporter des bugs ou des données inexactes.</li>
          <li>Les fonctionnalités peuvent être incomplètes ou non finalisées.</li>
          <li>Les données ne sont pas sauvegardées ni utilisées à des fins commerciales.</li>
        </ul>
      </section>

      <section>
        <h2 className="support-h2">À propos du projet</h2>
        <p>
          BlaBlaBook a été conçu dans un cadre pédagogique pour apprendre le développement web, la gestion de projet et les bonnes pratiques UX/UI.
        </p>
      </section>
    </main>
  );
};

export default Support;
