import { Request, Response, NextFunction } from 'express';

/**
 * Formate une date au format francais DD/MM/YYYY
 * 
 * @param date - Peut recevoir une Date, un string (comme "2024-01-15") ou null
 * @returns string formate (comme "15/01/2024") ou null
 * 
 * Exemples:
 * - formatDateToFrench(new Date('1802-02-26')) → "26/02/1802"
 * - formatDateToFrench('1885-05-22') → "22/05/1885"
 * - formatDateToFrench(null) → null
 * - formatDateToFrench('texte invalid') → null
 */
const formatDateToFrench = (date: Date | string | null): string | null => {
    // ETAPE 1: Verification de base - Si date est null, undefined, ou vide → retourne null
    if (!date) {return null;}
    
    // ETAPE 2: Protection contre les erreurs avec try/catch
    try {
        // Cree un objet Date - accepte Date, string ou timestamp
        const d = new Date(date);
        
        // ETAPE 3: Validation de la date
        // Pourquoi ? Car new Date("texte invalide") ne plante pas mais cree "Invalid Date"
        // new Date("blabla").getTime() → NaN, new Date("2024-01-15").getTime() → 1705276800000
        if (isNaN(d.getTime())) {return null;}
        
        // ETAPE 4: Extraction des composants de date
        const day = d.getDate().toString().padStart(2, '0');          // 5 → "05"
        const month = (d.getMonth() + 1).toString().padStart(2, '0'); // 0 → "01" (PIEGE: getMonth() = 0-11!)
        const year = d.getFullYear();                                 // 2024
        
        // padStart(2, '0') ajoute un zero devant si necessaire:
        // "5".padStart(2, '0') → "05", "15".padStart(2, '0') → "15"
        
        // ETAPE 5: Construction du resultat au format DD/MM/YYYY
        return `${day}/${month}/${year}`;
    } catch (error) {
        // ETAPE 6: Gestion des erreurs imprevues - retourne null plutot que planter l'app
        return null;
    }
};

// Transforme recursivement tous les champs de date dans un objet
const transformDates = (obj: any, visited = new WeakSet()): any => {
    if (!obj || typeof obj !== 'object') {return obj;}
    
    // Protection contre les references circulaires
    if (visited.has(obj)) {return obj;}
    visited.add(obj);
    
    // Si c'est un Array, traite chaque element
    if (Array.isArray(obj)) {
        return obj.map(item => transformDates(item, visited));
    }
    
    // Si c'est un objet Sequelize, ne traiter que dataValues et les relations
    if (obj.dataValues) {
        const result: any = {
            ...obj,
            dataValues: transformDates(obj.dataValues, visited)
        };
        
        // Traiter les relations Many-to-Many (ex: BookHasAuthors)
        for (const [key, value] of Object.entries(obj)) {
            if (Array.isArray(value) && key !== 'dataValues' && !key.startsWith('_')) {
                result[key] = transformDates(value, visited);
            }
        }
        
        return result;
    }
    
    const transformed: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
        // Ignorer les proprietes internes de Sequelize qui causent des boucles
        if (key.startsWith('_') || key === 'uniqno' || key === 'isNewRecord') {
            transformed[key] = value;
            continue;
        }
        
        // Detecte les champs de date par leur nom
        if (key.includes('date') || key.includes('_at') || key === 'created_at' || key === 'updated_at') {
            // Pour les timestamps (created_at, updated_at), on garde le format ISO
            if (key === 'created_at' || key === 'updated_at' || key.includes('_at')) {
                transformed[key] = value; // Garde le format timestamp
            } else {
                // Pour les dates metier (birth_date, death_date), on formate en francais
                transformed[key] = formatDateToFrench(value as Date | string);
            }
        } else if (typeof value === 'object' && value !== null) {
            // Recursion pour les objets imbriques
            transformed[key] = transformDates(value, visited);
        } else {
            transformed[key] = value;
        }
    }
    
    return transformed;
};

// Middleware qui transforme automatiquement les dates dans les reponses JSON
export const dateFormatterMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Sauvegarde de la methode json originale
    const originalJson = res.json.bind(res);
    
    // Override de la methode json pour transformer les dates
    res.json = function(data: any) {
        try {
            // Utiliser JSON.stringify avec replacer pour eliminer les references circulaires
            const cleanData = JSON.parse(JSON.stringify(data, (key, value) => {
                // Ignorer les proprietes Sequelize internes qui causent des problemes
                if (key.startsWith('_') || 
                    key === 'parent' || 
                    key === 'through' || 
                    key === 'uniqno' || 
                    key === 'isNewRecord' ||
                    key === 'sequelize' ||
                    key === 'Model') {
                    return undefined;
                }
                return value;
            }));
            
            // Transforme toutes les dates sur les donnees nettoyees
            const transformedData = transformDates(cleanData);
            return originalJson(transformedData);
        } catch (error) {
            // En cas d'erreur, renvoyer la donnee originale sans transformation
            console.error('Erreur dans dateFormatterMiddleware:', error);
            return originalJson(data);
        }
    };
    
    next();
};

export default dateFormatterMiddleware;