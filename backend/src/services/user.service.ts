import { Op } from 'sequelize';
import User from '../models/User.js';
import Role from '../models/Role.js';
import Permission from '../models/Permission.js';
import Library from '../models/Library.js';
import Notice from '../models/Notice.js';
import Rate from '../models/Rate.js';
import { UserSearchQuery, UpdateProfileInput } from '../validation/user.zod.js';

export class UserService {

    public async findAll(query: any) {
        try {
            const { page = 1, limit = 20, query: searchTerm, email, username } = query as UserSearchQuery;
            const offset = (page - 1) * limit;

            const where: Record<string, any> = {};

            // Recherche generale dans plusieurs champs
            if (searchTerm) {
                (where as any)[Op.or] = [
                    { firstname: { [Op.iLike]: `%${searchTerm}%` } },
                    { lastname: { [Op.iLike]: `%${searchTerm}%` } },
                    { username: { [Op.iLike]: `%${searchTerm}%` } },
                    { email: { [Op.iLike]: `%${searchTerm}%` } }
                ];
                console.log(`Recherche utilisateurs generale: "${searchTerm}"`);
            }

            // Recherche specifique par email
            if (email) {
                where['email'] = { [Op.iLike]: `%${email}%` };
                console.log(`Recherche par email: "${email}"`);
            }

            // Recherche specifique par username
            if (username) {
                where['username'] = { [Op.iLike]: `%${username}%` };
                console.log(`Recherche par username: "${username}"`);
            }

            const { rows: users, count: total } = await User.findAndCountAll({
                where,
                attributes: ['id_user', 'firstname', 'lastname', 'username', 'email', 'created_at', 'connected_at'],
                include: [{
                    model: Role,
                    as: 'Roles',
                    attributes: ['id_role', 'name'],
                    through: { attributes: [] }
                }],
                limit,
                offset,
                order: [['created_at', 'DESC']]
            });
            
            const totalPages = Math.ceil(total / limit);
            
            console.log(`Recherche utilisateurs: ${users.length}/${total} resultats (page ${page}/${totalPages})`);
            
            return {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            };
            
        } catch (error) {
            console.error('Erreur recherche utilisateurs:', error);
            throw error;
        }
    }

    public async findById(id: number): Promise<User | null> {
        try {
            const user = await User.findByPk(id, {
                attributes: ['id_user', 'firstname', 'lastname', 'username', 'created_at', 'connected_at'],
                include: [{
                    model: Role,
                    as: 'Roles',
                    attributes: ['id_role', 'name'],
                    through: { attributes: [] }
                }]
            });
            
            if (!user) {
                console.log(`Utilisateur non trouve: ID ${id}`);
                return null;
            }
            
            console.log(`Utilisateur trouve: "${user.get('username')}"`);
            return user;
            
        } catch (error) {
            console.error(`Erreur recherche utilisateur ID ${id}:`, error);
            throw error;
        }
    }

    public async findProfileById(id: number): Promise<User | null> {
        try {
            const user = await User.findByPk(id, {
                attributes: ['id_user', 'firstname', 'lastname', 'username', 'email', 'created_at', 'connected_at'],
                include: [{
                    model: Role,
                    as: 'Roles',
                    attributes: ['id_role', 'name'],
                    through: { attributes: [] },
                    include: [{
                        model: Permission,
                        as: 'Permissions',
                        attributes: ['label'],
                        through: { attributes: [] }
                    }]
                }]
            });
            
            if (!user) {
                console.log(`Profil utilisateur non trouve: ID ${id}`);
                return null;
            }
            
            console.log(`Profil utilisateur charge: "${user.get('username')}"`);
            return user;
            
        } catch (error) {
            console.error(`Erreur chargement profil ID ${id}:`, error);
            throw error;
        }
    }

    public async updateProfile(id: number, updateData: UpdateProfileInput): Promise<User | null> {
        try {
            const user = await User.findByPk(id);
            if (!user) {
                console.log(`Utilisateur a mettre a jour non trouve: ID ${id}`);
                return null;
            }
            
            console.log(`Mise a jour profil: "${user.get('username')}"`);
            
            // Filtre les valeurs undefined
            const cleanData = Object.fromEntries(
                Object.entries(updateData).filter(([, value]) => value !== undefined)
            );
            
            await user.update(cleanData);
            
            // Recharger l'utilisateur avec les nouvelles donnees
            const updatedUser = await User.findByPk(id, {
                attributes: ['id_user', 'firstname', 'lastname', 'username', 'email', 'created_at', 'connected_at'],
                include: [{
                    model: Role,
                    as: 'Roles',
                    attributes: ['id_role', 'name'],
                    through: { attributes: [] }
                }]
            });
            
            console.log(`Profil mis a jour avec succes: ID ${id}`);
            return updatedUser;
            
        } catch (error) {
            console.error(`Erreur mise a jour profil ID ${id}:`, error);
            throw error;
        }
    }

    public async delete(id: number): Promise<boolean> {
        try {
            const user = await User.findByPk(id);
            
            if (!user) {
                console.log(`Utilisateur a supprimer non trouve: ID ${id}`);
                return false;
            }
            
            const username = user.get('username');
            
            await user.destroy();
            
            console.log(`Compte utilisateur supprime: "${username}" (ID ${id})`);
            return true;
            
        } catch (error) {
            console.error(`Erreur suppression utilisateur ID ${id}:`, error);
            throw error;
        }
    }

    public async getUserStats(id: number): Promise<{user: any, stats: any} | null> {
        try {
            const user = await User.findByPk(id, {
                attributes: ['id_user', 'firstname', 'lastname', 'username']
            });
            
            if (!user) {
                console.log(`Utilisateur pour stats non trouve: ID ${id}`);
                return null;
            }
            
            console.log(`Calcul stats pour: "${user.get('username')}"`);
            
            const [librariesCount, noticesCount, ratesCount] = await Promise.all([
                Library.count({ where: { id_user: id } }),
                Notice.count({ where: { id_user: id } }),
                Rate.count({ where: { id_user: id } })
            ]);
            
            const result = {
                user: {
                    id: user.get('id_user'),
                    name: `${user.get('firstname')} ${user.get('lastname')}`,
                    username: user.get('username')
                },
                stats: {
                    librariesCount,
                    noticesCount,
                    ratesCount
                }
            };
            
            console.log(`Stats calculees: ${librariesCount} bibliotheques, ${noticesCount} notices, ${ratesCount} notes`);
            
            return result;
            
        } catch (error) {
            console.error(`Erreur calcul stats utilisateur ID ${id}:`, error);
            throw error;
        }
    }
}