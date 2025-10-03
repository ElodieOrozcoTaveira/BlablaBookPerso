import React from 'react';
import './FAQ.scss';

const FAQ: React.FC = () => {
  return (
    <main className="faq-page">
      <section>
        <h1 className='faq-h1'>FAQ – BlaBlaBook</h1>
        <p className='update'>Dernière mise à jour : 27 août 2025</p>
      </section>

      <section className="faq-list">
        <article>
          <h2 className='faq-h2'>Qu'est-ce que BlaBlaBook ?</h2>
          <p>
            BlaBlaBook est une application fictive développée dans un cadre scolaire. Elle permet de consulter une bibliothèque virtuelle alimentée par l’API publique OpenLibrary.
          </p>
        </article>

        <article>
          <h2 className='faq-h2'>Comment chercher un livre ?</h2>
          <p>
            Tu peux utiliser la barre de recherche sur la page d'accueil pour rechercher des livres par titre, auteur ou mot-clé. Les résultats sont fournis en temps réel via OpenLibrary.
          </p>
        </article>

        <article>
          <h2 className='faq-h2'>Les couvertures ne s'affichent pas, c’est normal ?</h2>
          <p>
            Cela peut arriver si certains livres n’ont pas d’image dans la base de données d’OpenLibrary. C’est un comportement normal dans une API publique.
          </p>
        </article>

        <article>
          <h2 className='faq-h2'>BlaBlaBook collecte-t-elle mes données personnelles ?</h2>
          <p>
            Non. BlaBlaBook ne collecte ni ne stocke aucune donnée personnelle. Pour plus de détails, consulte notre <a href="/privacy">politique de confidentialité</a>.
          </p>
        </article>

        <article>
          <h2 className='faq-h2'> Que faire si l'application bug ?</h2>
          <p>
            BlaBlaBook est un projet scolaire, donc certains bugs peuvent survenir. Tu peux nous envoyer un message à <a className='mail' href="mailto:support@blablabook.fake">support@blablabook.fake</a> (adresse fictive).
          </p>
        </article>

        <article>
          <h2 className='faq-h2'>Puis-je sauvegarder ma bibliothèque ?</h2>
          <p>
            Non, BlaBlaBook ne sauvegarde pas les données des utilisateurs. Ce projet est uniquement en lecture et ne comporte pas de base de données utilisateur.
          </p>
        </article>
      </section>
    </main>
  );
};

export default FAQ;
