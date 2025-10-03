@startuml
start
:Page d'accueil;

if (Utilisateur connecté ?) then (oui)
  :Récupérer le rôle depuis la BDD;

  if (Rôle = Utilisateur) then (oui)
    :Voir sa bibliothèque;
    :Ajouter un livre à sa bibliothèque;
    :Retirer un livre de sa bibliothèque;
    :Rechercher un livre;
    :Voir les détails d'un livre;
    :Créer des listes de lecture;
    :Mettre des livres dans la liste de lecture;
    :Changer le statut du livre (à lire, lu, pas encore lu);
  else (non)
    if (Rôle = Administrateur) then (oui)
      :Fonctionnalités de l'utilisateur;
      note right
        - Voir sa bibliothèque  
        - Ajouter un livre à sa bibliothèque  
        - Retirer un livre de sa bibliothèque  
        - Rechercher un livre  
        - Voir les détails d'un livre  
        - Créer des listes de lecture  
        - Mettre des livres dans la liste de lecture  
        - Changer le statut du livre (à lire, lu, pas encore lu)
      end note
      :Gérer les utilisateurs;
      :Ajouter / Modifier / Supprimer des livres;
      :Modifier le contenu;
    
    endif
  endif

  :Déconnexion;

else (non)
  :Rester sur la page d'accueil;
  :Voir des livres aléatoires;
  :Rechercher un livre via moteur de recherche;
  :S'inscrire;
  :Se connecter;
endif

stop
@enduml
