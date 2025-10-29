import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "../components/layout/Footer/Footer";

describe("Footer component", () => {
  it("renders correctly with expected content", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    // Vérifier la présence des images par alt
    expect(screen.getByAltText("figma logo")).toBeInTheDocument();
    expect(screen.getByAltText("x logo")).toBeInTheDocument();
    expect(screen.getByAltText("instagram logo")).toBeInTheDocument();
    expect(screen.getByAltText("youtube logo")).toBeInTheDocument();
    expect(screen.getByAltText("linkedin logo")).toBeInTheDocument();

    // Vérifier certains textes de navigation
    expect(screen.getByText("© 2025 BlaBlaBook")).toBeInTheDocument();
    expect(screen.getByText("Mentions Légales")).toBeInTheDocument();
    expect(
      screen.getByText("Politique de confidentialité")
    ).toBeInTheDocument();

    // Vérifier les titres "Informations sur le site" et "Centre d'aide"
    expect(screen.getByText("Informations sur le site")).toBeInTheDocument();
    expect(screen.getByText(/centre d'aide/i)).toBeInTheDocument(); // le /i permet de trouver le texte meme si' il y a des varaiations de casse ou d'espace. 

    // Vérifier un lien dans Explore
    expect(screen.getByText("FAQ")).toBeInTheDocument();
  });
});