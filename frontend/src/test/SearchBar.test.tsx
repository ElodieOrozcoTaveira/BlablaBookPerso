import "@testing-library/jest-dom";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import SearchBar from "../components/common/SearchBar/SearchBar";

// Nettoie le DOM après chaque test
afterEach(() => {
  cleanup();
});

describe("SearchBar", () => {
  it("affiche la barre de recherche", () => {
    render(<SearchBar />);
    expect(
      screen.getByPlaceholderText(/rechercher un livre/i)
    ).toBeInTheDocument();
  });

  it("affiche les résultats lors de la saisie", () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/rechercher un livre/i);
    fireEvent.change(input, { target: { value: "Harry" } });
    expect(screen.getByText(/Harry Potter/i)).toBeInTheDocument();
  });

  it("affiche le message Aucun livre trouvé si aucun résultat", () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText(/rechercher un livre/i);
    fireEvent.change(input, { target: { value: "zzzzzz" } });
    expect(screen.getByText(/Aucun livre trouvé/i)).toBeInTheDocument();
  });
});
