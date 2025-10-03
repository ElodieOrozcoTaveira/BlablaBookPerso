import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export class ImageService {
    private coversDir = path.join(process.cwd(), 'uploads', 'covers');
    private avatarsDir = path.join(process.cwd(), 'uploads', 'avatars');

    constructor() {
        // S'assurer que les dossiers existent
        if (!fs.existsSync(this.coversDir)) {
            fs.mkdirSync(this.coversDir, { recursive: true });
        }
        if (!fs.existsSync(this.avatarsDir)) {
            fs.mkdirSync(this.avatarsDir, { recursive: true });
        }
    }

    // Traiter une image uploadee et creer toutes les tailles
    async processImage(imageBuffer: Buffer, type: 'book' | 'author', id: number, coverId?: number): Promise<string> {
        try {
            // Utiliser coverId si fourni, sinon timestamp pour uploads manuels
            const baseFilename = coverId 
                ? `${type}-${id}-cover-${coverId}` 
                : `${type}-${id}-${Date.now()}`;
            const uploadsDir = type === 'book' ? this.coversDir : this.avatarsDir;
            const urlPrefix = type === 'book' ? '/uploads/covers' : '/uploads/avatars';

            // Vérifier si les fichiers existent déjà (cache)
            if (coverId && await this.checkExistingFiles(baseFilename, uploadsDir)) {
                console.log(`Cache hit: Images déjà existantes pour ${baseFilename}`);
                return this.buildExistingFilesJson(baseFilename, urlPrefix, type);
            }

            // Creer differentes tailles selon le type
            const sizes = type === 'author' 
                ? [
                    { suffix: 'thumb', width: 100, height: 100 },  // Avatar petit
                    { suffix: 'small', width: 200, height: 200 }   // Avatar moyen
                  ]
                : [
                    { suffix: 'thumb', width: 150, height: 240 },
                    { suffix: 'small', width: 300, height: 480 },
                    { suffix: 'medium', width: 600, height: 960 }
                  ];

            const createdFiles: Record<string, string> = {};

            for (const size of sizes) {
                const filename = `${baseFilename}-${size.suffix}.webp`;
                const filepath = path.join(uploadsDir, filename);

                await sharp(imageBuffer)
                    .resize(size.width, size.height, {
                        fit: 'cover',
                        position: 'center'
                    })
                    .webp({
                        quality: 80,
                        effort: 4 // Balance qualite/vitesse
                    })
                    .toFile(filepath);

                createdFiles[size.suffix] = `${urlPrefix}/${filename}`;
            }

            console.log(`Images creees pour ${type} ${id}: ${Object.keys(createdFiles).length} tailles`);

            // Retourner l'objet JSON avec toutes les tailles
            return JSON.stringify(createdFiles);

        } catch (error) {
            console.error(`Erreur traitement image ${type} ${id}:`, error);
            throw error;
        }
    }

    // Vérifier si tous les fichiers d'un baseFilename existent
    private async checkExistingFiles(baseFilename: string, uploadsDir: string): Promise<boolean> {
        try {
            const expectedSizes = ['thumb', 'small', 'medium']; // Pour books
            
            for (const size of expectedSizes) {
                const filepath = path.join(uploadsDir, `${baseFilename}-${size}.webp`);
                if (!fs.existsSync(filepath)) {
                    return false; // Un fichier manque
                }
            }
            
            return true; // Tous les fichiers existent
        } catch (error) {
            return false; // Erreur = pas de cache
        }
    }

    // Construire le JSON des fichiers existants
    private buildExistingFilesJson(baseFilename: string, urlPrefix: string, type: 'book' | 'author'): string {
        const sizes = type === 'author' 
            ? ['thumb', 'small']
            : ['thumb', 'small', 'medium'];

        const existingFiles: Record<string, string> = {};
        
        for (const size of sizes) {
            const filename = `${baseFilename}-${size}.webp`;
            existingFiles[size] = `${urlPrefix}/${filename}`;
        }

        return JSON.stringify(existingFiles);
    }

    // Supprimer les anciennes images (livre ou auteur)
    async deleteImages(imageUrl: string, type: 'book' | 'author'): Promise<void> {
        try {
            if (!imageUrl) {return;}

            // Parse l'objet JSON des URLs
            const imageUrls = JSON.parse(imageUrl);
            const uploadsDir = type === 'book' ? this.coversDir : this.avatarsDir;

            for (const url of Object.values(imageUrls) as string[]) {
                const filename = path.basename(url);
                const filepath = path.join(uploadsDir, filename);

                if (fs.existsSync(filepath)) {
                    fs.unlinkSync(filepath);
                    console.log(`Image supprimee: ${filename}`);
                }
            }
        } catch (error) {
            console.error('Erreur suppression images:', error);
            // Ne pas faire echouer le processus pour ca
        }
    }

    // Valider qu'un fichier est bien une image
    async validateImage(buffer: Buffer): Promise<boolean> {
        try {
            const metadata = await sharp(buffer).metadata();
            return !!(metadata.width && metadata.height);
        } catch {
            return false;
        }
    }

    // Obtenir les infos d'une image
    async getImageInfo(buffer: Buffer) {
        try {
            const metadata = await sharp(buffer).metadata();
            return {
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                size: buffer.length
            };
        } catch (error) {
            console.error('Erreur lecture metadonnees image:', error);
            throw error;
        }
    }

    // Methodes de compatibilite pour l'ancien code
    async processUploadedImage(imageBuffer: Buffer, bookId: number): Promise<string> {
        return this.processImage(imageBuffer, 'book', bookId);
    }
    
    async deleteBookImages(coverUrl: string): Promise<void> {
        return this.deleteImages(coverUrl, 'book');
    }
}