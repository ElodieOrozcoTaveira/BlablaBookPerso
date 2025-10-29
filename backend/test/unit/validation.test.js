import { describe, it, expect } from 'vitest';
import { z } from "zod";
// Import des schémas de validation
const registerSchema = z.object({
    username: z.string().min(3).max(30),
    email: z.string().email(),
    password: z.string().min(8),
    firstname: z.string().min(2).max(50),
    lastname: z.string().min(2).max(50),
});
describe("Validation Schemas", () => {
    describe("registerSchema", () => {
        it("devrait valider des données correctes", () => {
            const validData = {
                username: "testuser",
                email: "test@example.com",
                password: "TestPassword123!",
                firstname: "Jean",
                lastname: "Dupont",
            };
            const result = registerSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });
        it("devrait rejeter un email invalide", () => {
            const invalidData = {
                username: "testuser",
                email: "invalid-email",
                password: "TestPassword123!",
                firstname: "Jean",
                lastname: "Dupont",
            };
            const result = registerSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
        it("devrait rejeter un username trop court", () => {
            const invalidData = {
                username: "ab",
                email: "test@example.com",
                password: "TestPassword123!",
                firstname: "Jean",
                lastname: "Dupont",
            };
            const result = registerSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
        it("devrait rejeter un mot de passe trop court", () => {
            const invalidData = {
                username: "testuser",
                email: "test@example.com",
                password: "short",
                firstname: "Jean",
                lastname: "Dupont",
            };
            const result = registerSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });
});
//# sourceMappingURL=validation.test.js.map