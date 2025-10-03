#!/usr/bin/env node

import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/openlibrary';

async function testOpenLibraryIntegration() {
    console.log('🚀 Test intégration Open Library endpoints...\n');
    
    try {
        // Test 1: Recherche simple dans Open Library
        console.log('📚 Test 1: Recherche simple "Harry Potter"');
        const searchResponse = await axios.get(`${BASE_URL}/search/books`, {
            params: { query: 'Harry Potter', limit: 5 }
        });
        
        console.log(`✅ Status: ${searchResponse.status}`);
        console.log(`📊 Résultats: ${searchResponse.data.data.length} livres`);
        console.log(`🔢 Total: ${searchResponse.data.pagination.total}`);
        
        if (searchResponse.data.data.length > 0) {
            const firstBook = searchResponse.data.data[0];
            console.log(`📖 Premier livre: "${firstBook.title}"`);
            console.log(`👤 Auteurs: ${firstBook.authors.join(', ')}`);
            console.log(`📅 Année: ${firstBook.publication_year || 'N/A'}`);
            console.log(`🖼️  Couverture: ${firstBook.cover_url || 'Aucune'}`);
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Test 2: Recherche par genre
        console.log('🏷️  Test 2: Recherche par genre "Fantasy"');
        const genreResponse = await axios.get(`${BASE_URL}/search/books`, {
            params: { genre: 'Fantasy', limit: 3 }
        });
        
        console.log(`✅ Status: ${genreResponse.status}`);
        console.log(`📊 Résultats Fantasy: ${genreResponse.data.data.length} livres`);
        
        genreResponse.data.data.forEach((book, index) => {
            console.log(`${index + 1}. "${book.title}" (${book.publication_year || 'N/A'})`);
        });
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Test 3: Recherche avancée
        console.log('🔍 Test 3: Recherche avancée - Stephen King + Horror');
        const advancedResponse = await axios.get(`${BASE_URL}/search/books/advanced`, {
            params: { 
                author: 'Stephen King', 
                genre: 'Horror',
                limit: 3
            }
        });
        
        console.log(`✅ Status: ${advancedResponse.status}`);
        console.log(`📊 Résultats Stephen King Horror: ${advancedResponse.data.data.length} livres`);
        
        advancedResponse.data.data.forEach((book, index) => {
            console.log(`${index + 1}. "${book.title}" par ${book.authors.join(', ')}`);
        });
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Test 4: Détails d'un livre spécifique
        console.log('📖 Test 4: Détails livre spécifique');
        if (searchResponse.data.data.length > 0) {
            const firstBook = searchResponse.data.data[0];
            const bookKey = firstBook.open_library_key;
            
            if (bookKey) {
                console.log(`🔍 Récupération détails pour: ${bookKey}`);
                const detailsResponse = await axios.get(`${BASE_URL}/book/details`, {
                    params: { key: bookKey }
                });
                
                console.log(`✅ Status: ${detailsResponse.status}`);
                const book = detailsResponse.data.data;
                console.log(`📖 Titre: "${book.title}"`);
                console.log(`👥 Auteurs: ${book.authors?.join(', ') || 'N/A'}`);
                console.log(`📝 Description: ${book.description ? (book.description.substring(0, 100) + '...') : 'N/A'}`);
                console.log(`🏷️  Genres: ${book.subjects?.slice(0, 3).join(', ') || 'N/A'}`);
            }
        }
        
        console.log('\n' + '='.repeat(50) + '\n');
        
        // Test 5: Recherche d'auteur
        console.log('👤 Test 5: Recherche d\'auteur "J.K. Rowling"');
        const authorResponse = await axios.get(`${BASE_URL}/search/authors`, {
            params: { query: 'J.K. Rowling', limit: 3 }
        });
        
        console.log(`✅ Status: ${authorResponse.status}`);
        console.log(`📊 Résultats auteurs: ${authorResponse.data.data.length}`);
        
        authorResponse.data.data.forEach((author, index) => {
            console.log(`${index + 1}. ${author.name}`);
            console.log(`   🔑 Clé: ${author.open_library_key}`);
            if (author.bio) {
                console.log(`   📝 Bio: ${author.bio.substring(0, 80)}...`);
            }
        });
        
        console.log('\n🎉 Tous les tests d\'intégration OpenLibrary terminés avec succès !');
        
    } catch (error) {
        console.error('❌ Erreur lors des tests OpenLibrary:', error.message);
        if (error.response) {
            console.error(`📊 Status: ${error.response.status}`);
            console.error(`📝 Réponse:`, error.response.data);
        }
        process.exit(1);
    }
}

// Lancer les tests
testOpenLibraryIntegration();
