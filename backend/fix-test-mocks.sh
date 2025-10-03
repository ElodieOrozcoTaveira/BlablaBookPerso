#!/bin/bash

# Script pour corriger les mocks des tests en une seule fois

echo "🔧 Fixing test mocks..."

# Fichiers de tests a corriger (excluant users.test.ts et authors.test.ts deja corriges)
test_files=(
    "tests/unit/routes/books.test.ts"
    "tests/unit/routes/uploads.test.ts" 
    "tests/unit/routes/genres.test.ts"
    "tests/unit/routes/rates.test.ts"
    "tests/unit/routes/notices.test.ts"
    "tests/unit/routes/auth.test.ts"
    "tests/unit/routes/reading-lists.test.ts"
    "tests/unit/routes/libraries.test.ts"
)

for file in "${test_files[@]}"; do
    if [ -f "$file" ]; then
        echo "Fixing $file..."
        
        # Ajouter l'import des mocks en haut du fichier apres les autres imports
        sed -i '/^import.*from.*@jest\/globals/a import { mockAuthenticateToken, mockRequirePermission } from "../../utils/auth-mocks.js";' "$file"
        
        # Remplacer tous les mocks d'auth dupliques par une seule version propre
        sed -i '/^\/\/ Mock du middleware/,/^}));$/d' "$file"
        sed -i '/^jest\.mock.*auth\.js.*$/,/^}));$/d' "$file"
        
        # Ajouter les mocks propres apres les imports
        sed -i '/import { mockAuthenticateToken, mockRequirePermission }/a \\n// Mock des middleware d'\''authentification et d'\''autorisation\njest.mock("../../../src/middleware/auth.js", () => ({\n    authenticateToken: mockAuthenticateToken()\n}));\n\njest.mock("../../../src/middleware/authorization.js", () => ({\n    requirePermission: mockRequirePermission()\n}));' "$file"
        
        echo "✅ Fixed $file"
    else
        echo "⚠️ File $file not found"
    fi
done

echo "🎉 All test mocks fixed!"