import { render, screen } from '@testing-library/react';
import Footer from '../components/layout/Footer/Footer';

describe('Footer component', () => {
  it('renders correctly with expected content', () => {
    render(<Footer />);

    // Vérifier la présence des images par alt
    expect(screen.getByAltText('figma logo')).toBeInTheDocument();
    expect(screen.getByAltText('x logo')).toBeInTheDocument();
    expect(screen.getByAltText('instagram logo')).toBeInTheDocument();
    expect(screen.getByAltText('youtube logo')).toBeInTheDocument();
    expect(screen.getByAltText('linkedin logo')).toBeInTheDocument();

    // Vérifier certains textes de navigation
    expect(screen.getByText('© 2025 BlaBlaBook')).toBeInTheDocument();
    expect(screen.getByText('Mentions Légales')).toBeInTheDocument();
    expect(screen.getByText('Politique de confidentialité')).toBeInTheDocument();

    // Vérifier les titres "Use cases" et "Explore"
    expect(screen.getByText('Use cases')).toBeInTheDocument();
    expect(screen.getByText('Explore')).toBeInTheDocument();

    // Vérifier un lien dans Explore
    expect(screen.getByText('FAQ')).toBeInTheDocument();
  });
});
