import { OpenLibraryService } from '../../src/services/openlibrary.service.js';

async function testOpenLibrary() {
    console.log('🔍 Test complet Open Library Service...\n');
    
    const openLibraryService = new OpenLibraryService();
    
    try {
        // Test 1: Recherche simple
        console.log('📚 Test 1: Recherche simple "Harry Potter"');
        const searchResults = await openLibraryService.searchBooks('Harry Potter', 3);
        console.log(`✅ Trouvé ${searchResults.num_found} livres`);
        
        if (searchResults.docs.length > 0) {
            const book = searchResults.docs[0];
            console.log(`📖 Premier livre: "${book.title}" par ${book.author_name?.[0] || 'Inconnu'}`);
            console.log(`   Année: ${book.first_publish_year || 'Inconnue'}`);
            
            if (book.cover_i) {
                const coverUrl = openLibraryService.getCoverUrl(book.cover_i, 'M');
                console.log(`   🖼️  Couverture: ${coverUrl}`);
            }
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Test 2: Recherche par genre
        console.log('🏷️  Test 2: Recherche par genre "Science Fiction"');
        const genreResults = await openLibraryService.searchBooksByGenre('Science Fiction', 3);
        console.log(`✅ Trouvé ${genreResults.num_found} livres de science-fiction`);
        
        genreResults.docs.slice(0, 2).forEach((book, index) => {
            console.log(`${index + 1}. "${book.title}" par ${book.author_name?.[0] || 'Inconnu'} (${book.first_publish_year || 'N/A'})`);
            console.log(`   Genres: ${book.subject?.slice(0, 3).join(', ') || 'Aucun'}`);
        });
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Test 3: Recherche avancée
        console.log('🔍 Test 3: Recherche avancée - Fantasy publié après 2000');
        const advancedResults = await openLibraryService.searchBooksAdvanced({
            genre: 'Fantasy',
            publishedAfter: 2000,
            limit: 3
        });
        console.log(`✅ Trouvé ${advancedResults.num_found} livres fantasy récents`);
        
        advancedResults.docs.forEach((book, index) => {
            console.log(`${index + 1}. "${book.title}" (${book.first_publish_year || 'N/A'})`);
        });
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Test 4: Détails d'un livre et de son auteur
        if (searchResults.docs.length > 0) {
            const firstBook = searchResults.docs[0];
            console.log(`📖 Test 4: Détails du livre "${firstBook.title}"`);
            
            const bookDetails = await openLibraryService.getBookDetails(firstBook.key);
            const description = openLibraryService.extractDescription(bookDetails.description);
            
            console.log(`📝 Description: ${description ? description.substring(0, 150) + '...' : 'Aucune'}`);
            console.log(`🏷️  Sujets: ${bookDetails.subjects?.slice(0, 5).join(', ') || 'Aucun'}`);
            
            // Test auteur si disponible
            if (bookDetails.authors && bookDetails.authors.length > 0) {
                const authorKey = bookDetails.authors[0].author?.key;
                console.log(`\n👤 Détails de l'auteur:`);
                console.log(`   Clé auteur: ${authorKey}`);
                console.log(`   Structure auteur:`, JSON.stringify(bookDetails.authors[0], null, 2));
                
                const authorDetails = await openLibraryService.getAuthorDetails(authorKey);
                console.log(`   Nom: ${authorDetails.name}`);
                
                const authorBio = openLibraryService.extractDescription(authorDetails.bio);
                console.log(`   Bio: ${authorBio ? authorBio.substring(0, 100) + '...' : 'Aucune'}`);
                
                if (authorDetails.birth_date) {
                    console.log(`   Naissance: ${authorDetails.birth_date}`);
                }
                
                if (authorDetails.photos && authorDetails.photos.length > 0) {
                    const photoUrl = openLibraryService.getAuthorPhotoUrl(authorDetails.photos[0], 'M');
                    console.log(`   📸 Photo: ${photoUrl}`);
                }
            }
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Test 5: Recherche par auteur spécifique
        console.log('👨‍💼 Test 5: Recherche avancée par auteur "Stephen King"');
        const authorResults = await openLibraryService.searchBooksAdvanced({
            author: 'Stephen King',
            limit: 3
        });
        console.log(`✅ Trouvé ${authorResults.num_found} livres de Stephen King`);
        
        authorResults.docs.forEach((book, index) => {
            console.log(`${index + 1}. "${book.title}" (${book.first_publish_year || 'N/A'})`);
        });
        
        console.log('\n🎉 Tous les tests Open Library terminés avec succès !');
        
    } catch (error) {
        console.error('❌ Erreur durant les tests:', error);
    }
}

// Lancer les tests
testOpenLibrary();