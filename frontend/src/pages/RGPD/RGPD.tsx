import './RGPD.scss';

import React from "react"


const Privacy: React.FC = () => {
  return (
    <>
    <div className="privacy-policy">
      <h1 className='privacy-h1' >Politique de Confidentialité – BlaBlaBook</h1>
      <p className='update' ><strong>Dernière mise à jour :</strong> 27 août 2025</p>

      <section>
        <h2 className='privacy-h2' >1. Qui sommes-nous ?</h2>
        <p>
          <strong>BlaBlaBook</strong> est un projet fictif développé dans le cadre d’un projet scolaire.
          Il ne vise <strong>aucune activité commerciale</strong> et n’a pas pour but de collecter,
          stocker ou exploiter des données personnelles à des fins commerciales.
        </p>
        <p>
          <strong>Responsable du traitement :</strong><br />
          Équipe BlaBlaBook – Projet scolaire fictif
        </p>
      </section>

      <section>
        <h2 className='privacy-h2'>2. Quelles données sont collectées ?</h2>
        <p>
          L'application <strong>ne collecte pas de données personnelles</strong> directement liées aux utilisateurs.
          Nous utilisons uniquement l’<strong>API OpenLibrary</strong> pour afficher des informations sur les livres
          (titre, auteur, image de couverture, etc.).
        </p>
      </section>

      <section>
        <h2 className='privacy-h2'>3. Utilisation des données</h2>
        <p>
          Les données récupérées via OpenLibrary sont utilisées uniquement pour :
        </p>
        <ul>
          <li>Afficher les livres dans la bibliothèque virtuelle</li>
          <li>Permettre la recherche et la consultation d’ouvrages</li>
          <li>Illustrer l’interface utilisateur</li>
        </ul>
        <p>Aucune donnée utilisateur n’est stockée de manière persistante.</p>
      </section>

      <section>
        <h2 className='privacy-h2'>4. Cookies et traceurs</h2>
        <p>
          L'application <strong>BlaBlaBook</strong> utilise uniquement des cookies strictement nécessaire conformément à l'article 82  de la CNIL.

        </p>
      </section>

      <section>
        <h2 className='privacy-h2'>5. Partage des données</h2>
        <p>
          Les seules données utilisées proviennent de l’API <strong>OpenLibrary</strong>. Aucune information utilisateur n’est partagée avec un tiers.
        </p>
      </section>

      <section>
        <h2 className='privacy-h2'>6. Vos droits</h2>
        <p>
          Bien que cette application ne collecte pas de données personnelles, nous tenons à rappeler que, dans un cadre réel et professionnel, tout utilisateur bénéficie des droits suivants :
        </p>
        <ul>
          <li>Droit d’accès</li>
          <li>Droit de rectification</li>
          <li>Droit à l’effacement</li>
          <li>Droit d’opposition</li>
          <li>Droit à la portabilité</li>
        </ul>
        <p>
          Pour plus d’informations, vous pouvez consulter le site de la CNIL :{' '}
          <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
            www.cnil.fr
          </a>
        </p>
      </section>

      <section>
        <h2 className='privacy-h2'>7. Sécurité</h2>
        <p>
          BlaBlaBook est un projet fictif. Aucune donnée personnelle n’est stockée, mais les échanges avec des services externes (comme OpenLibrary) sont effectués dans le respect des bonnes pratiques, notamment via une connexion sécurisée (HTTPS).
        </p>
      </section>

      <section>
        <h2 className='privacy-h2'>8. Utilisation de l’API OpenLibrary</h2>
        <p>
          Nous utilisons l’API publique <strong>OpenLibrary</strong> pour enrichir notre base de données fictive de livres.
        </p>
        <p>
          Pour plus d'informations, vous pouvez consulter leur site officiel :{' '}
          <a href="https://openlibrary.org" target="_blank" rel="noopener noreferrer">
            https://openlibrary.org
          </a>
        </p>
      </section>

      <section>
        <h2 className='privacy-h2'>9. Contact</h2>
        <p>
          Pour toute question liée à cette politique, vous pouvez nous contacter à l'adresse suivante :<br />
          📧 <a className='mail' href="mailto:contact@blablabook.fake">contact@blablabook.fake</a>
        </p>
        <p>
          (Adresse fictive utilisée à des fins pédagogiques)
        </p>
      </section>

      <section>
        <h2 className='privacy-h2'>10. Avertissement pédagogique</h2>
        <p>
          Cette application est un projet scolaire sans vocation commerciale. Cette politique de confidentialité est fournie à des fins pédagogiques et ne constitue pas un document légal officiel.
        </p>
      </section>
    </div>
    </>
  );
};

export default Privacy;