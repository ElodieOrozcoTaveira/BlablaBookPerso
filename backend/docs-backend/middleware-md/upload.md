
# Middleware : upload

## Problème résolu

Comment permettre l’upload sécurisé de fichiers (avatars, couvertures, etc.) tout en limitant les risques (type, taille, exécution) ?

## Mécanisme technique

Les routes d’upload utilisent des middlewares pour :

- Vérifier l’authentification de l’utilisateur
- Valider le type et la taille du fichier (image uniquement, taille max)
- Traiter l’image (redimensionnement, conversion) via un service dédié (Sharp)
- Stocker le fichier dans le dossier approprié (`uploads/avatars` ou `uploads/covers`)
- Mettre à jour la ressource associée (ex : URL de couverture dans le modèle Book)

## Exemple de code

```ts
// Route d’upload de couverture de livre
router.post('/book/:book_id/cover', 
    authenticateToken,
    validateParams(idParamSchema), 
    uploadBookCover
);

// Contrôleur d’upload
export const uploadBookCover = async (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'Aucun fichier image fourni' });
// Valider et traiter l’image
// Stocker dans /uploads/covers
// Mettre à jour le modèle Book
};
```

## Avantages

- Sécurise l’upload et le stockage des fichiers.
- Limite les risques (type, taille, exécution).
- Centralise le traitement des images et la gestion des dossiers.
