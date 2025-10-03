import React from 'react';
import './CGVU.scss';import { useNavigate } from 'react-router-dom';
; // Ajoute du style si tu veux

const CGV: React.FC = () => {
  const navigate = useNavigate();
  return (
    <main className="CGVU">
      <section>
        <h1 className="cgvu-h1">Conditions Générales d’Utilisation – BlaBlaBook</h1>
        <p className='cgvu-update' >Dernière mise à jour : 27 août 2025</p>
      </section>

      <section>
        <h2 className="cgvu-h2">1. Présentation de l'application</h2>
        <p>
          <strong>BlaBlaBook</strong> est une application fictive développée dans le cadre d’un projet scolaire. Elle permet aux utilisateurs de consulter une bibliothèque virtuelle de livres grâce à des données récupérées depuis l’API publique d’OpenLibrary.
        </p>
      </section>

      <section>
        <h2 className="cgvu-h2">2. Acceptation des conditions</h2>
        <p>
          En accédant à l'application BlaBlaBook, l'utilisateur accepte pleinement et sans réserve les présentes Conditions Générales d’Utilisation (CGU).
        </p>
      </section>

      <section>
        <h2 className="cgvu-h2">3. Fonctionnalités proposées</h2>
        <p>
          L’application permet :
        </p>
        <ul>
          <li>La recherche de livres via des mots-clés</li>
          <li>L’affichage des informations publiques des ouvrages (titre, auteur, couverture, etc.)</li>
          <li>La consultation d’une bibliothèque personnelle (dans certains cas, localement uniquement)</li>
        </ul>
      </section>

      <section>
        <h2 className="cgvu-h2">4. Propriété intellectuelle</h2>
        <p>
          L’ensemble des contenus, interfaces et éléments graphiques développés dans BlaBlaBook sont protégés et appartiennent à leurs auteurs respectifs.
        </p>
        <p>
          Les informations sur les livres proviennent de l’API OpenLibrary (contenus publics).
        </p>
      </section>

      <section>
        <h2 className="cgvu-h2">5. Responsabilités</h2>
        <p>
          BlaBlaBook est un projet pédagogique. Aucun engagement contractuel ou de garantie n’est proposé. L’équipe ne peut être tenue responsable en cas de bug, erreur, ou indisponibilité temporaire du service.
        </p>
        <p>
          L’utilisation de données externes (OpenLibrary) est soumise à leurs propres conditions.
        </p>
      </section>

      <section>
        <h2 className="cgvu-h2">6. Comportement des utilisateurs</h2>
        <p>
          L’utilisateur s’engage à utiliser l’application de manière respectueuse, à ne pas chercher à compromettre son fonctionnement et à ne pas détourner son usage.
        </p>
      </section>

      <section>
        <h2 className="cgvu-h2">7. Données personnelles</h2>
        <p>
          BlaBlaBook ne collecte pas de données personnelles. Pour en savoir plus, veuillez consulter notre <a onClick={()=> navigate(`/privacy`) } href="/privacy">Politique de Confidentialité</a>.
        </p>
      </section>

      <section>
        <h2 className="cgvu-h2">8. Liens externes</h2>
        <p>
          BlaBlaBook peut afficher des contenus provenant de services tiers comme OpenLibrary. Nous ne pouvons être tenus responsables de ces contenus ni de leur exactitude.
        </p>
      </section>

      <section>
        <h2 className="cgvu-h2">9. Modification des CGU</h2>
        <p>
          Ces conditions peuvent être modifiées à tout moment pour s’adapter à l’évolution du projet. L’utilisateur est invité à les consulter régulièrement.
        </p>
      </section>

      <section>
        <h2 className="cgvu-h2">10. Contact</h2>
        <p>
          Pour toute question relative à l’utilisation de l’application, vous pouvez nous contacter à l’adresse : <a className='cgvu-mail' href="mailto:contact@blablabook.fake">contact@blablabook.fake</a>
        </p>
      </section>
    </main>
  );
};

export default CGV;
