// ✅ LES MOCKS EN PREMIER, AVANT TOUS LES IMPORTS
jest.mock("../../src/models/User.js");
jest.mock("../../src/services/PasswordService.js");

// PUIS les imports
import { AuthService } from "../../src/services/AuthService.js";
import { User } from "../../src/models/User.js";
import { PasswordService } from "../../src/services/PasswordService.js";

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("devrait créer un nouvel utilisateur", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "TestPassword123!",
        firstname: "Test",
        lastname: "User",
      };

      const mockUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
      };

      // Configuration des mocks
      (User.findOne as jest.Mock) = jest.fn().mockResolvedValue(null);
      (PasswordService.hashPassword as jest.Mock) = jest.fn().mockResolvedValue("hashed_pwd");
      (User.create as jest.Mock) = jest.fn().mockResolvedValue(mockUser);

      const result = await AuthService.registerUser(userData);

      expect(User.findOne).toHaveBeenCalled();
      expect(PasswordService.hashPassword).toHaveBeenCalled();
      expect(User.create).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it("devrait rejeter si l'email existe déjà", async () => {
      const userData = {
        username: "testuser",
        email: "existing@example.com",
        password: "TestPassword123!",
        firstname: "Test",
        lastname: "User",
      };

      (User.findOne as jest.Mock) = jest.fn().mockResolvedValue({ id: 1 });

      await expect(AuthService.registerUser(userData)).rejects.toThrow();
    });
  });

  describe("authenticateUser", () => {
    it("devrait authentifier un utilisateur valide", async () => {
      const credentials = {
        email: "test@example.com",
        password: "TestPassword123!",
      };

      const mockUser = {
        id: 1,
        email: "test@example.com",
        password: "hashed_password",
        username: "testuser",
      };

      (User.findOne as jest.Mock) = jest.fn().mockResolvedValue(mockUser);
      (PasswordService.verifyPassword as jest.Mock) = jest.fn().mockResolvedValue(true);

      const result = await AuthService.authenticateUser(credentials);

      expect(result).toBeDefined();
      expect(result.email).toBe(credentials.email);
    });

    it("devrait rejeter pour un email inexistant", async () => {
      (User.findOne as jest.Mock) = jest.fn().mockResolvedValue(null);

      await expect(
        AuthService.authenticateUser({
          email: "wrong@example.com",
          password: "password",
        })
      ).rejects.toThrow();
    });
  });
});