# 🚀 Guide d'Optimisation des Images Frontend

## 🎯 Objectif : Passer de 55 à 80+ sur Lighthouse

Le backend génère déjà automatiquement 3 tailles d'images optimisées en WebP. Ce guide explique comment les utiliser côté frontend.

---

## 📊 État actuel vs optimisé

### ❌ **Avant (problèmes Lighthouse)**
```tsx
// Image unique, lourde, non optimisée
<img src={book.cover_url} alt={book.title} />
```

**Problèmes :**
- LCP 11,270ms (trop lent)
- Images mal dimensionnées (-1,893 KiB)
- Format non optimisé (-286 KiB)

### ✅ **Après (optimisé)**
```tsx
// Images multiples, adaptives, WebP
<picture>
  <source srcSet={coverUrls.medium} media="(min-width: 768px)" />
  <img 
    src={coverUrls.small} 
    width="300" 
    height="480"
    loading="lazy"
    alt={book.title}
  />
</picture>
```

**Gains attendus :**
- ⚡ LCP réduit de 40-60%
- 📦 Poids images -60% 
- 🎯 Score Lighthouse 55 → 80+

---

## 🔧 Format des données backend

Le champ `cover_url` contient un JSON avec 3 tailles :

```json
{
  "thumb": "/uploads/covers/book-123-thumb.webp",    // 150x240
  "small": "/uploads/covers/book-123-small.webp",    // 300x480  
  "medium": "/uploads/covers/book-123-medium.webp"   // 600x960
}
```

---

## 💻 Implémentation Frontend

### 1. Hook personnalisé pour parser les URLs

```tsx
// hooks/useImageUrls.ts
import { useMemo } from 'react';

interface ImageUrls {
  thumb: string;
  small: string;
  medium: string;
}

export const useImageUrls = (coverUrl: string | null): ImageUrls | null => {
  return useMemo(() => {
    if (!coverUrl) return null;
    
    try {
      return JSON.parse(coverUrl);
    } catch {
      // Fallback pour anciennes images non-JSON
      return {
        thumb: coverUrl,
        small: coverUrl,
        medium: coverUrl
      };
    }
  }, [coverUrl]);
};
```

### 2. Composant BookCover optimisé

```tsx
// components/BookCover.tsx
import React from 'react';
import { useImageUrls } from '../hooks/useImageUrls';

interface BookCoverProps {
  coverUrl: string | null;
  title: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const BookCover: React.FC<BookCoverProps> = ({
  coverUrl,
  title,
  size = 'medium',
  className = ''
}) => {
  const imageUrls = useImageUrls(coverUrl);
  
  if (!imageUrls) {
    return (
      <div className={`book-cover-placeholder ${className}`}>
        <span>Pas de couverture</span>
      </div>
    );
  }

  // Dimensions selon la taille demandée
  const dimensions = {
    small: { width: 150, height: 240 },
    medium: { width: 300, height: 480 },
    large: { width: 600, height: 960 }
  };

  const { width, height } = dimensions[size];

  return (
    <picture className={className}>
      {/* Image haute résolution pour desktop */}
      <source 
        srcSet={imageUrls.medium} 
        media="(min-width: 768px)" 
      />
      
      {/* Image standard pour mobile */}
      <img
        src={imageUrls.small}
        alt={`Couverture de ${title}`}
        width={width}
        height={height}
        loading="lazy"
        style={{ aspectRatio: '5/8' }}
      />
    </picture>
  );
};
```

### 3. Composant responsive avancé

```tsx
// components/ResponsiveBookCover.tsx
import React from 'react';
import { useImageUrls } from '../hooks/useImageUrls';

interface ResponsiveBookCoverProps {
  coverUrl: string | null;
  title: string;
  priority?: boolean; // Pour LCP - charge immédiatement
  className?: string;
}

export const ResponsiveBookCover: React.FC<ResponsiveBookCoverProps> = ({
  coverUrl,
  title,
  priority = false,
  className = ''
}) => {
  const imageUrls = useImageUrls(coverUrl);
  
  if (!imageUrls) return null;

  return (
    <picture className={className}>
      {/* Desktop/tablette : image moyenne */}
      <source 
        srcSet={imageUrls.medium} 
        media="(min-width: 768px)" 
      />
      
      {/* Mobile : image petite */}
      <source 
        srcSet={imageUrls.small} 
        media="(max-width: 767px)" 
      />
      
      {/* Image par défaut */}
      <img
        src={imageUrls.small}
        alt={`Couverture de ${title}`}
        width="300"
        height="480"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        style={{ 
          aspectRatio: '5/8',
          objectFit: 'cover',
          width: '100%',
          height: 'auto'
        }}
      />
    </picture>
  );
};
```

---

## 🎯 Cas d'usage spécifiques

### Page de détail livre (LCP critique)
```tsx
// pages/DetailsLivre.tsx
import { ResponsiveBookCover } from '../components/ResponsiveBookCover';

export default function DetailsLivre() {
  return (
    <section className="section-container">
      <div className="section-container__left">
        <ResponsiveBookCover
          coverUrl={book.cover_url}
          title={book.title}
          priority={true} // LCP - charge immédiatement
          className="section-container__cover"
        />
      </div>
      {/* ... */}
    </section>
  );
}
```

### Liste de livres (lazy loading)
```tsx
// components/BookList.tsx
import { BookCover } from '../components/BookCover';

export const BookList: React.FC<{ books: Book[] }> = ({ books }) => {
  return (
    <div className="book-grid">
      {books.map(book => (
        <div key={book.id} className="book-card">
          <BookCover
            coverUrl={book.cover_url}
            title={book.title}
            size="small" // Plus petite pour les listes
          />
          <h3>{book.title}</h3>
        </div>
      ))}
    </div>
  );
};
```

### Avatar utilisateur (si applicable)
```tsx
// components/UserAvatar.tsx
export const UserAvatar: React.FC<{ user: User }> = ({ user }) => {
  const avatarUrls = useImageUrls(user.avatar_url);
  
  return (
    <picture className="user-avatar">
      <source srcSet={avatarUrls?.small} media="(min-width: 480px)" />
      <img
        src={avatarUrls?.thumb || '/default-avatar.webp'}
        alt={`Avatar de ${user.username}`}
        width="100"
        height="100"
        loading="lazy"
      />
    </picture>
  );
};
```

---

## 🎨 CSS pour aspect ratio

```scss
// Maintenir le ratio 5:8 des couvertures de livres
.book-cover img,
.book-cover picture {
  aspect-ratio: 5/8;
  object-fit: cover;
  width: 100%;
  height: auto;
}

// Placeholder pendant chargement
.book-cover-placeholder {
  aspect-ratio: 5/8;
  background: linear-gradient(135deg, #f0f0f0, #e0e0e0);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 0.9rem;
}

// Grid responsive pour listes
.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

@media (min-width: 768px) {
  .book-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
```

---

## ⚡ Optimisations avancées

### Preload pour LCP
```tsx
// Dans <head> pour l'image principale
const preloadImage = () => {
  if (book.cover_url) {
    const urls = JSON.parse(book.cover_url);
    return (
      <link
        rel="preload"
        as="image"
        href={urls.medium}
        media="(min-width: 768px)"
      />
    );
  }
  return null;
};
```

### Intersection Observer pour lazy loading avancé
```tsx
// hooks/useLazyImage.ts
import { useState, useEffect, useRef } from 'react';

export const useLazyImage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' } // Charge 50px avant d'être visible
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return { isVisible, imgRef };
};
```

---

## 🔍 Debug et validation

### Vérifier le format des données
```tsx
// Utilitaire de debug
export const debugImageUrls = (coverUrl: string | null) => {
  console.log('Cover URL brute:', coverUrl);
  
  if (coverUrl) {
    try {
      const parsed = JSON.parse(coverUrl);
      console.log('URLs parsées:', parsed);
      
      // Vérifier que toutes les tailles existent
      const requiredSizes = ['thumb', 'small', 'medium'];
      const missingSizes = requiredSizes.filter(size => !parsed[size]);
      
      if (missingSizes.length > 0) {
        console.warn('Tailles manquantes:', missingSizes);
      }
    } catch (e) {
      console.error('Erreur parsing cover_url:', e);
    }
  }
};
```

### DevTools - vérifier les images chargées
1. **Network tab** : vérifier que les bonnes tailles se chargent
2. **Lighthouse** : mesurer l'amélioration du score
3. **Performance** : vérifier la réduction du LCP

---

## 📋 Checklist d'implémentation

### Phase 1 : Composants de base (30 min)
- [ ] Créer `hooks/useImageUrls.ts`
- [ ] Créer `components/BookCover.tsx`
- [ ] Ajouter le CSS pour aspect-ratio

### Phase 2 : Intégration (15 min)
- [ ] Remplacer les `<img>` par `<BookCover>` dans les listes
- [ ] Utiliser `<ResponsiveBookCover priority={true}>` pour LCP
- [ ] Ajouter `width` et `height` explicites

### Phase 3 : Optimisations (15 min)
- [ ] Ajouter preload pour image principale
- [ ] Tester avec Lighthouse
- [ ] Ajuster les media queries si nécessaire

### Phase 4 : Validation
- [ ] Score Lighthouse > 80
- [ ] LCP < 5 secondes
- [ ] Images correctement dimensionnées
- [ ] Pas d'erreurs console

---

## 🎯 Résultats attendus

**Avant :**
- LCP : 11,270ms
- Poids images : ~2MB
- Score Lighthouse : 55

**Après :**
- LCP : ~4,000ms (-65%)
- Poids images : ~800KB (-60%)
- Score Lighthouse : 80+ (+45%)

---

## 🆘 Troubleshooting

### Images ne se chargent pas
- Vérifier que `cover_url` contient un JSON valide
- Vérifier les URLs générées (`/uploads/covers/...`)
- Vérifier que les fichiers existent sur le serveur

### Mauvaises dimensions
- S'assurer que `width` et `height` sont définis
- Utiliser `aspect-ratio` en CSS
- Vérifier les media queries

### LCP toujours lent
- Utiliser `priority={true}` sur l'image principale
- Ajouter preload dans `<head>`
- Vérifier que l'image est above-the-fold

---

**🎉 Avec ces optimisations, votre score Lighthouse devrait passer de 55 à 80+ !**