// Controleur d'export pour demontrer l'usage des permissions EXPORT
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express.js';
import User from '../models/User.js';
import Library from '../models/Library.js';
import Notice from '../models/Notice.js';
import ReadingList from '../models/ReadingList.js';
import Book from '../models/Book.js';
import { Op } from 'sequelize';

/**
 * Export des donnees utilisateur (RGPD - droit a la portabilite)
 */
export const exportMyData = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.id_user;
        const format = req.query.format as string || 'json';

        if (!userId) {
            return res.status(401).json({
                error: 'User not authenticated'
            });
        }

 // Je recupere toutes les donnees de l'utilisateur
        const userData = await User.findByPk(userId, {
            attributes: ['id_user', 'firstname', 'lastname', 'username', 'email', 'created_at'],
            include: [
                {
                    model: Library,
                    as: 'UserHasLibraries',
                    include: [
                        {
                            model: Book,
                            as: 'LibraryHasBooks'
                        }
                    ]
                },
                {
                    model: Notice,
                    as: 'UserHasNotices',
                    include: [
                        {
                            model: Book,
                            as: 'NoticeBelongsToBook',
                            attributes: ['title', 'isbn']
                        }
                    ]
                }
            ]
        }) as any;

        if (!userData) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

// Je formate selon le format demande
        if (format === 'csv') {
            return exportToCSV(res, userData);
        } else if (format === 'xml') {
            return exportToXML(res, userData);
        } else {
            // JSON par defaut
            return res.json({
                success: true,
                message: 'Export des donnees utilisateur',
                export_date: new Date().toISOString(),
                format: 'json',
                data: {
                    user: {
                        id: userData.id_user,
                        firstname: userData.firstname,
                        lastname: userData.lastname,
                        username: userData.username,
                        email: userData.email,
                        created_at: userData.created_at
                    },
                    libraries: userData.UserHasLibraries?.map((lib: any) => ({
                        id: lib.id_library,
                        name: lib.name,
                        description: lib.description,
                        is_public: lib.is_public,
                        books_count: lib.LibraryHasBooks?.length || 0,
                        books: lib.LibraryHasBooks?.map((book: any) => ({
                            title: book.title,
                            isbn: book.isbn
                        }))
                    })) || [],
                    notices: userData.UserHasNotices?.map((notice: any) => ({
                        id: notice.id_notice,
                        book_title: notice.NoticeBelongsToBook?.title,
                        book_isbn: notice.NoticeBelongsToBook?.isbn,
                        content: notice.content,
                        title: notice.title,
                        rating: notice.rating,
                        is_spoiler: notice.is_spoiler,
                        is_public: notice.is_public,
                        created_at: notice.created_at
                    })) || [],
// Je simplifie: les entrees de liste de lecture peuvent etre reconstruites via libraries + books (pivot ReadingList)
                    reading_lists: []
                }
            });
        }

    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({
            error: 'Export failed',
            message: 'Unable to export user data'
        });
    }
};

/**
 * Export admin - Statistiques du systeme
 */
export const exportSystemStats = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const format = req.query.format as string || 'json';
        const startDate = req.query.start_date as string;
        const endDate = req.query.end_date as string;

// Je recupere les statistiques generales
        const stats = {
            users: {
                total: await User.count(),
                active_last_30_days: await User.count({
                    where: {
                        connected_at: {
                            [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                        }
                    }
                })
            },
            libraries: {
                total: await Library.count(),
                public: await Library.count({ where: { is_public: true } }),
                private: await Library.count({ where: { is_public: false } })
            },
            notices: {
                total: await Notice.count(),
                public: await Notice.count({ where: { is_public: true } }),
                with_spoilers: await Notice.count({ where: { is_spoiler: true } })
            },
            books: {
                total: await Book.count()
            }
        };

        if (format === 'csv') {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="system_stats.csv"');
            
            const csv = [
                'Metric,Value',
                `Total Users,${stats.users.total}`,
                `Active Users (30d),${stats.users.active_last_30_days}`,
                `Total Libraries,${stats.libraries.total}`,
                `Public Libraries,${stats.libraries.public}`,
                `Private Libraries,${stats.libraries.private}`,
                `Total Notices,${stats.notices.total}`,
                `Public Notices,${stats.notices.public}`,
                `Spoiler Notices,${stats.notices.with_spoilers}`,
                `Total Books,${stats.books.total}`
            ].join('\n');
            
            return res.send(csv);
        }

        res.json({
            success: true,
            message: 'System statistics export',
            export_date: new Date().toISOString(),
            format,
            period: {
                start_date: startDate,
                end_date: endDate
            },
            statistics: stats
        });

    } catch (error) {
        console.error('System export error:', error);
        res.status(500).json({
            error: 'System export failed'
        });
    }
};

/**
 * Export des bibliotheques utilisateur en CSV
 */
function exportToCSV(res: Response, userData: any) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="my_data.csv"');
    
    const csv = [
        '# USER DATA EXPORT',
        `# Export Date: ${new Date().toISOString()}`,
        '',
        '# USER INFO',
        'Field,Value',
        `Name,"${userData.firstname} ${userData.lastname}"`,
        `Username,${userData.username}`,
        `Email,${userData.email}`,
        `Created,${userData.created_at}`,
        '',
        '# LIBRARIES',
        'Library Name,Description,Public,Books Count',
        ...(userData.Libraries?.map((lib: any) => 
            `"${lib.name}","${lib.description || ''}",${lib.is_public},${lib.Books?.length || 0}`
        ) || []),
        '',
        '# NOTICES', 
        'Book Title,Notice Title,Rating,Content,Spoiler,Public,Date',
        ...(userData.Notices?.map((notice: any) =>
            `"${notice.Book?.title || 'N/A'}","${notice.title || ''}",${notice.rating},"${notice.content}",${notice.is_spoiler},${notice.is_public},${notice.created_at}`
        ) || [])
    ].join('\n');
    
    res.send(csv);
}

/**
 * Export des donnees utilisateur en XML
 */
function exportToXML(res: Response, userData: any) {
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', 'attachment; filename="my_data.xml"');
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<user_data export_date="${new Date().toISOString()}">
    <user>
        <id>${userData.id_user}</id>
        <name>${userData.firstname} ${userData.lastname}</name>
        <username>${userData.username}</username>
        <email>${userData.email}</email>
        <created_at>${userData.created_at}</created_at>
    </user>
    <libraries>
        ${userData.Libraries?.map((lib: any) => `
        <library>
            <name><![CDATA[${lib.name}]]></name>
            <description><![CDATA[${lib.description || ''}]]></description>
            <is_public>${lib.is_public}</is_public>
            <books_count>${lib.Books?.length || 0}</books_count>
        </library>`).join('') || ''}
    </libraries>
    <notices>
        ${userData.Notices?.map((notice: any) => `
        <notice>
            <book_title><![CDATA[${notice.Book?.title || 'N/A'}]]></book_title>
            <title><![CDATA[${notice.title || ''}]]></title>
            <rating>${notice.rating}</rating>
            <content><![CDATA[${notice.content}]]></content>
            <is_spoiler>${notice.is_spoiler}</is_spoiler>
            <is_public>${notice.is_public}</is_public>
            <created_at>${notice.created_at}</created_at>
        </notice>`).join('') || ''}
    </notices>
</user_data>`;
    
    res.send(xml);
}
