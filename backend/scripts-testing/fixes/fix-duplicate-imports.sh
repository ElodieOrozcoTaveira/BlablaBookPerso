#!/bin/bash

echo "🔧 Correction des imports en double..."

# Fonction pour corriger les imports en double dans un fichier
fix_duplicates() {
    local file="$1"
    echo "🔍 Traitement de $file"
    
    # Creer un fichier temporaire
    temp_file=$(mktemp)
    
    # Variables pour suivre les imports deja ajoutes
    seen_imports=()
    skip_line=false
    
    # Lire le fichier ligne par ligne
    while IFS= read -r line; do
        # Verifier si c'est un import d'auth-mocks
        if [[ $line == *"mockAuthenticateToken"* && $line == *"../../utils/auth-mocks.js"* ]]; then
            # Verifier si on a deja vu cet import
            if [[ " ${seen_imports[@]} " =~ " auth-mocks " ]]; then
                # Skip cette ligne car c'est un doublon
                continue
            else
                # Marquer comme vu
                seen_imports+=("auth-mocks")
                echo "$line" >> "$temp_file"
            fi
        else
            echo "$line" >> "$temp_file"
        fi
    done < "$file"
    
    # Remplacer le fichier original
    mv "$temp_file" "$file"
    echo "✅ Corrige: $file"
}

# Trouver tous les fichiers de test et les corriger
find tests/ -name "*.test.ts" -type f | while read -r file; do
    if grep -q "mockAuthenticateToken.*../../utils/auth-mocks.js" "$file"; then
        # Compter le nombre d'occurrences
        count=$(grep -c "mockAuthenticateToken.*../../utils/auth-mocks.js" "$file")
        if [ "$count" -gt 1 ]; then
            fix_duplicates "$file"
        fi
    fi
done

echo "✅ Correction des imports en double terminee!"
