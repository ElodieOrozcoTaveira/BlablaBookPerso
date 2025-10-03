import './_Footer.scss';

export default function Footer() {
    
    return(
        <footer className="footer-container">
            <article className="footer-container__articleleft">
                <div className="footer-container__figma">
                    <img src="/logos/figma.webp" alt="figma logo" className="footer-image" />
                <p className="footer-container__reseaux">Suivez nous sur les réseaux</p>
                </div>
                <div className="footer-container__logos">
                    <img src="/logos/x.webp" alt="x logo" className="footer-container__img" />
                    <img src="/logos/instagram.webp" alt="instagram logo" className="footer-container__img" />
                    <img src="/logos/youtube.webp" alt="youtube logo" className="footer-container__img" />
                    <img src="/logos/linkedin.webp" alt="linkedin logo" className="footer-container__img" />
                </div>
            </article>

            <article className="footer-container__articlemiddle">
                <div className="footer-container__useCases">
                    <h3 className="footer-container__h3UseCases">I<span>nformations sur le sit</span>e</h3>
                    <div className="footer-container__navs">
                <nav className="footer-container__navigation">

                    <a href="#" className="footer-container__navigation">© 2025 BlaBlaBook</a>
                    <a href="#" className="footer-container__navigation">Mentions Légales</a>
                </nav>
                <nav>
                    <a href="#" className="footer-container__navigation">Politique de confidentialité</a>
                    <a href="#" className="footer-container__navigation">CGV / CGU</a>
                </nav>
                    </div>
                </div>
            </article>

             <article className="footer-container__articleright">
                <div className="footer-container__explore">
                <h3 className="footer-container__h3explore">C<span>entre d'Aid</span>e</h3>
                <div className="footer-container__navs">
                    <nav className="footer-container__navigation2">
                    <a href="#" className="footer-container__link">FAQ</a>
                    <a href="#" className="footer-container__link">Support</a>
                    </nav>
                    <nav className="footer-container__navigation3">
                    <a href="#" className="footer-container__link">Home</a>
                    <a href="#" className="footer-container__link">Contact</a>
                    </nav>
                    <nav className="footer-container__navigation3">
                    <a href="#" className="footer-container__link">A propos</a>
                    </nav>

                </div>
                </div>

            </article>
        </footer>
    )
}
