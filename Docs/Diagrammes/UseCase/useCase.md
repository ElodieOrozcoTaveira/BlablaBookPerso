
@startuml
left to right direction
skinparam packageStyle rectangle

actor Visiteur
actor Utilisateur
actor Administrateur

rectangle BlaBlaBook {
  
  
  (Lister les utilisateurs) as listerUsers
  
 rectangle Auth {
  (S'inscrire) as inscrire
  (Se connecter) as connecter
  (Se déconnecter) as deconnecter
  }
 
 rectangle Bibliothèque{
   (Rechercher un livre) as recherche
   (Consulter page d'accueil) as accueil
   (Voir détails d’un livre) as detail
   (Ajouter livre à sa bibliothèque) as ajouter
   (Voir sa bibliothèque) as voirBiblio
   (Changer statut lu / à lire) as statut
   (Retirer livre de sa bibliothèque) as retirer
   (Supprimer un livre de la base) as supprimer
   (Modérer contenu) as moderer
   (Supprimer un livre de la bibliothèque) as supprimerlivrebiblio
 
 }

  Visiteur --> accueil
  Visiteur --> inscrire
  Visiteur --> connecter
  

  Utilisateur --> supprimerlivrebiblio
  Utilisateur --> recherche
  Utilisateur --> detail
  Utilisateur --> ajouter
  Utilisateur --> voirBiblio
  Utilisateur --> statut
  Utilisateur --> retirer
  Utilisateur --> deconnecter
  Utilisateur --> accueil

  Administrateur --> supprimer
  Administrateur --> moderer
  Administrateur --> listerUsers
  Administrateur --> ajouter
  Administrateur --> retirer
  Administrateur --> Visiteur
}

@enduml