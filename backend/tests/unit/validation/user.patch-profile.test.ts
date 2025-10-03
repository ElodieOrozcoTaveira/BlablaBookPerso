import { describe, it, expect } from 'vitest';
import { patchProfileSchema, changePasswordSchema } from '../../../src/validation/user.zod.js';

describe('User PATCH Profile Validation', () => {
    describe('patchProfileSchema', () => {
        it('should accept valid partial profile data', () => {
            const validData = {
                firstname: 'Jean'
            };
            
            const result = patchProfileSchema.parse(validData);
            expect(result).toEqual(validData);
        });

        it('should accept multiple fields', () => {
            const validData = {
                firstname: 'Jean',
                lastname: 'Dupont',
                username: 'jeandupont'
            };
            
            const result = patchProfileSchema.parse(validData);
            expect(result).toEqual(validData);
        });

        it('should trim whitespace', () => {
            const dataWithWhitespace = {
                firstname: '  Jean  '
            };
            
            const result = patchProfileSchema.parse(dataWithWhitespace);
            expect(result.firstname).toBe('Jean');
        });

        it('should reject empty object', () => {
            expect(() => {
                patchProfileSchema.parse({});
            }).toThrow('Au moins un champ doit etre modifie');
        });

        it('should reject empty firstname', () => {
            expect(() => {
                patchProfileSchema.parse({ firstname: '' });
            }).toThrow('Le prenom ne peut pas etre vide');
        });

        it('should reject too long firstname', () => {
            const longFirstname = 'a'.repeat(51);
            expect(() => {
                patchProfileSchema.parse({ firstname: longFirstname });
            }).toThrow('Le prenom ne peut pas depasser 50 caracteres');
        });

        it('should reject invalid username characters', () => {
            expect(() => {
                patchProfileSchema.parse({ username: 'user@name' });
            }).toThrow('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, _ et -');
        });

        it('should reject too short username', () => {
            expect(() => {
                patchProfileSchema.parse({ username: 'ab' });
            }).toThrow('Le nom d\'utilisateur doit faire au moins 3 caracteres');
        });

        it('should accept valid username with allowed characters', () => {
            const validData = {
                username: 'user_name-123'
            };
            
            const result = patchProfileSchema.parse(validData);
            expect(result.username).toBe('user_name-123');
        });
    });

    describe('changePasswordSchema', () => {
        it('should accept valid password change data', () => {
            const validData = {
                current_password: 'oldpassword',
                new_password: 'NewPassword123@',
                confirm_password: 'NewPassword123@'
            };
            
            const result = changePasswordSchema.parse(validData);
            expect(result).toEqual(validData);
        });

        it('should reject when passwords do not match', () => {
            const invalidData = {
                current_password: 'oldpassword',
                new_password: 'NewPassword123@',
                confirm_password: 'DifferentPassword123@'
            };
            
            expect(() => {
                changePasswordSchema.parse(invalidData);
            }).toThrow('La confirmation du mot de passe ne correspond pas');
        });

        it('should reject weak new password', () => {
            const invalidData = {
                current_password: 'oldpassword',
                new_password: 'weak',
                confirm_password: 'weak'
            };
            
            expect(() => {
                changePasswordSchema.parse(invalidData);
            }).toThrow();
        });

        it('should require uppercase in new password', () => {
            const invalidData = {
                current_password: 'oldpassword',
                new_password: 'newpassword123@',
                confirm_password: 'newpassword123@'
            };
            
            expect(() => {
                changePasswordSchema.parse(invalidData);
            }).toThrow('Le nouveau mot de passe doit contenir au moins une majuscule');
        });

        it('should require lowercase in new password', () => {
            const invalidData = {
                current_password: 'oldpassword',
                new_password: 'NEWPASSWORD123@',
                confirm_password: 'NEWPASSWORD123@'
            };
            
            expect(() => {
                changePasswordSchema.parse(invalidData);
            }).toThrow('Le nouveau mot de passe doit contenir au moins une minuscule');
        });

        it('should require digit in new password', () => {
            const invalidData = {
                current_password: 'oldpassword',
                new_password: 'NewPassword@',
                confirm_password: 'NewPassword@'
            };
            
            expect(() => {
                changePasswordSchema.parse(invalidData);
            }).toThrow('Le nouveau mot de passe doit contenir au moins un chiffre');
        });

        it('should require special character in new password', () => {
            const invalidData = {
                current_password: 'oldpassword',
                new_password: 'NewPassword123',
                confirm_password: 'NewPassword123'
            };
            
            expect(() => {
                changePasswordSchema.parse(invalidData);
            }).toThrow('Le nouveau mot de passe doit contenir au moins un caractere special');
        });

        it('should reject empty current password', () => {
            const invalidData = {
                current_password: '',
                new_password: 'NewPassword123@',
                confirm_password: 'NewPassword123@'
            };
            
            expect(() => {
                changePasswordSchema.parse(invalidData);
            }).toThrow('Le mot de passe actuel est requis');
        });

        it('should reject too long new password', () => {
            const longPassword = 'A'.repeat(70) + '123@';
            const invalidData = {
                current_password: 'oldpassword',
                new_password: longPassword,
                confirm_password: longPassword
            };
            
            expect(() => {
                changePasswordSchema.parse(invalidData);
            }).toThrow('Le nouveau mot de passe ne peut pas depasser 72 caracteres');
        });
    });
});