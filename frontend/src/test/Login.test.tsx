import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../pages/Login/Login";

describe("Login Component", () => {
  it("affiche correctement le formulaire de connexion", () => {
    render(
      <MemoryRouter> 
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText(/connexion/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /se connecter/i })).toBeInTheDocument();
  });
});
//memoryRouter permet de simuler un environnement de navigation en remplaçant BrowserRouter qui lui permet à React Router de gérer la navigation entre les pages via l’URL du navigateur 