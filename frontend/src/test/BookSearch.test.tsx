import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { describe, it, afterEach, expect, vi } from "vitest";
import BookSearch from "../components/ui/BookSearch/BookSearch";

// Nettoyage du DOM après chaque test
afterEach(() => cleanup());

// on simule la fonction searcbook pour le test
vi.mock("../api/booksApi", () => ({
  booksApi: {
    searchBooks: vi.fn(async (query: string) => {
      if (query.toLowerCase().includes("harry")) {
        return { data: [{ title: "Harry Potter" }], total: 1 };
      }
      return { data: [], total: 0 };
    }),
  },
}));

describe("Composant BookSearch", () => {
  it("affiche la barre de recherche", () => {
    render(<BookSearch />);
    expect(
      screen.getByPlaceholderText(/rechercher un livre/i)
    ).toBeInTheDocument();
  });

  it("affiche un résultat lors d’une recherche existante", async () => {
    render(<BookSearch />);
    const input = screen.getByPlaceholderText(/rechercher un livre/i);

    fireEvent.change(input, { target: { value: "Harry" } }); //simule un utilisateur qui tape une recherche
    fireEvent.click(screen.getByText(/Rechercher/i));//simule le clique de l'utilisateur 

    await waitFor(() => {
      expect(screen.getByText(/Harry Potter/i)).toBeInTheDocument();
    });
  });

  it("affiche le message 'Aucun livre trouvé' pour une recherche vide", async () => {
    render(<BookSearch />);
    const input = screen.getByPlaceholderText(/rechercher un livre/i);

    fireEvent.change(input, { target: { value: "zzzzzz" } });
    fireEvent.click(screen.getByText(/Rechercher/i));

    await waitFor(() => { //attend que le rendu du DOM soit mis à jour
      expect(screen.getByText(/Aucun livre trouvé/i)).toBeInTheDocument();
    });
  });
});

//le test permet de voir si l'input de la barre de recherceh existe, si une recherche valide affiche le livre et si le message 'aucun livre trouvé" s'affiche
