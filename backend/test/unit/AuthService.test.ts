import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { AuthService, AuthError } from "../../src/services/AuthService.js";
import { User } from "../../src/models/user.js";
import { PasswordService } from "../../src/services/PasswordService.js";

/**
 * TESTS UNITAIRES - AuthService
 */

// Mock des dépendances
jest.mock("../../src/models/user.js");
jest.mock("../../src/services/PasswordService.js");

const MockUser = User as jest.MockedClass<typeof User>;
const MockPasswordService = PasswordService as jest.Mocked<
  typeof PasswordService
>;

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("devrait créer un nouvel utilisateur avec succès", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "TestPassword123!",
        firstname: "Test",
        lastname: "User",
      };

      const hashedPassword = "hashed_password_123";
      const mockUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
        firstname: "Test",
        lastname: "User",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock des méthodes
      MockUser.findOne = jest.fn().mockResolvedValue(null); // Utilisateur n'existe pas
      MockPasswordService.hashPassword = jest
        .fn()
        .mockResolvedValue(hashedPassword);
      MockUser.create = jest.fn().mockResolvedValue(mockUser);

      const result = await AuthService.registerUser(userData);

      expect(MockUser.findOne).toHaveBeenCalledWith({
        where: { email: userData.email },
      });
      expect(MockPasswordService.hashPassword).toHaveBeenCalledWith(
        userData.password
      );
      expect(MockUser.create).toHaveBeenCalledWith({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        firstname: userData.firstname,
        lastname: userData.lastname,
      });
      expect(result).toEqual(mockUser);
    });

    it("devrait lever une erreur si l'email existe déjà", async () => {
      const userData = {
        username: "testuser",
        email: "existing@example.com",
        password: "TestPassword123!",
        firstname: "Test",
        lastname: "User",
      };

      const existingUser = { id: 1, email: "existing@example.com" };
      MockUser.findOne = jest.fn().mockResolvedValue(existingUser);

      await expect(AuthService.registerUser(userData)).rejects.toThrow(
        AuthError
      );
      expect(MockPasswordService.hashPassword).not.toHaveBeenCalled();
      expect(MockUser.create).not.toHaveBeenCalled();
    });
  });

  describe("authenticateUser", () => {
    it("devrait authentifier un utilisateur avec des identifiants corrects", async () => {
      const credentials = {
        email: "test@example.com",
        password: "TestPassword123!",
      };

      const mockUser = {
        id: 1,
        email: "test@example.com",
        password: "hashed_password",
        username: "testuser",
        firstname: "Test",
        lastname: "User",
      };

      MockUser.findOne = jest.fn().mockResolvedValue(mockUser);
      MockPasswordService.verifyPassword = jest.fn().mockResolvedValue(true);

      const result = await AuthService.authenticateUser(credentials);

      expect(MockUser.findOne).toHaveBeenCalledWith({
        where: { email: credentials.email },
      });
      expect(MockPasswordService.verifyPassword).toHaveBeenCalledWith(
        credentials.password,
        mockUser.password
      );
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        firstname: mockUser.firstname,
        lastname: mockUser.lastname,
      });
    });

    it("devrait lever une erreur pour un email inexistant", async () => {
      const credentials = {
        email: "nonexistent@example.com",
        password: "TestPassword123!",
      };

      MockUser.findOne = jest.fn().mockResolvedValue(null);

      await expect(AuthService.authenticateUser(credentials)).rejects.toThrow(
        AuthError
      );
      expect(MockPasswordService.verifyPassword).not.toHaveBeenCalled();
    });

    it("devrait lever une erreur pour un mot de passe incorrect", async () => {
      const credentials = {
        email: "test@example.com",
        password: "WrongPassword123!",
      };

      const mockUser = {
        id: 1,
        email: "test@example.com",
        password: "hashed_password",
      };

      MockUser.findOne = jest.fn().mockResolvedValue(mockUser);
      MockPasswordService.verifyPassword = jest.fn().mockResolvedValue(false);

      await expect(AuthService.authenticateUser(credentials)).rejects.toThrow(
        AuthError
      );
    });
  });
});
