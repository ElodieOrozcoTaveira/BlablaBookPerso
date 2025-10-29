import { describe, it, expect, beforeEach } from "@jest/globals";
import { PasswordService } from "../../src/services/PasswordService.js";
/**
 * TESTS UNITAIRES - PasswordService
 */
describe("PasswordService", () => {
    describe("hashPassword", () => {
        it("devrait hasher un mot de passe", async () => {
            const password = "TestPassword123!";
            const hash = await PasswordService.hashPassword(password);
            expect(hash).toBeDefined();
            expect(hash).not.toBe(password);
            expect(hash.length).toBeGreaterThan(50); // Hash Argon2 fait plus de 50 caractères
        });
        it("devrait générer des hash différents pour le même mot de passe", async () => {
            const password = "TestPassword123!";
            const hash1 = await PasswordService.hashPassword(password);
            const hash2 = await PasswordService.hashPassword(password);
            expect(hash1).not.toBe(hash2); // Salt différent à chaque fois
        });
    });
    describe("verifyPassword", () => {
        it("devrait vérifier un mot de passe correct", async () => {
            const password = "TestPassword123!";
            const hash = await PasswordService.hashPassword(password);
            const isValid = await PasswordService.verifyPassword(password, hash);
            expect(isValid).toBe(true);
        });
        it("devrait rejeter un mot de passe incorrect", async () => {
            const correctPassword = "TestPassword123!";
            const wrongPassword = "WrongPassword456!";
            const hash = await PasswordService.hashPassword(correctPassword);
            const isValid = await PasswordService.verifyPassword(wrongPassword, hash);
            expect(isValid).toBe(false);
        });
        it("devrait rejeter un hash invalide", async () => {
            const password = "TestPassword123!";
            const invalidHash = "invalid-hash";
            const isValid = await PasswordService.verifyPassword(password, invalidHash);
            expect(isValid).toBe(false);
        });
    });
    describe("validatePasswordStrength", () => {
        it("devrait accepter un mot de passe fort", () => {
            const strongPassword = "TestPassword123!";
            const result = PasswordService.validatePasswordStrength(strongPassword);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        it("devrait rejeter un mot de passe trop court", () => {
            const shortPassword = "Test1!";
            const result = PasswordService.validatePasswordStrength(shortPassword);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Le mot de passe doit contenir au moins 8 caractères");
        });
        it("devrait rejeter un mot de passe sans majuscule", () => {
            const noUpperPassword = "testpassword123!";
            const result = PasswordService.validatePasswordStrength(noUpperPassword);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Le mot de passe doit contenir au moins une majuscule");
        });
        it("devrait rejeter un mot de passe sans chiffre", () => {
            const noNumberPassword = "TestPassword!";
            const result = PasswordService.validatePasswordStrength(noNumberPassword);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Le mot de passe doit contenir au moins un chiffre");
        });
        it("devrait rejeter un mot de passe sans caractère spécial", () => {
            const noSpecialPassword = "TestPassword123";
            const result = PasswordService.validatePasswordStrength(noSpecialPassword);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Le mot de passe doit contenir au moins un caractère spécial");
        });
    });
});
//# sourceMappingURL=PasswordService.test.js.map