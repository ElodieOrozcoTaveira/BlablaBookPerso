
export default function Footer() {
    
    return(
        <footer className="footer-container">
            <article className="footer-container__articleleft">
                <div className="footer-container__figma">
                    <img src="/logos/figma.webp" alt="figma logo" className="footer-image" />
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
                    <h3 className="footer-container__h3UseCases">Use cases</h3>
                </div>
                <nav>
                    <a href="#" className="footer-container__navigation">© 2025 BlaBlaBook</a>
                    <a href="#" className="footer-container__navigation">Mentions Légales</a>
                    <a href="#" className="footer-container__navigation">Politique de confidentialité</a>
                    <a href="#" className="footer-container__navigation">CGV / CGU</a>
                </nav>
            </article>

             <article className="footer-container__articleright">
                <div className="footer-container__explore">
                    <h3 className="footer-container__h3explore">Explore</h3>
                </div>
                <nav>
                    <a href="#" className="footer-container__navigation">FAQ</a>
                    <a href="#" className="footer-container__navigation">Support</a>
                    <a href="#" className="footer-container__navigation">Home</a>
                    <a href="#" className="footer-container__navigation">Contact</a>
                    <a href="#" className="footer-container__navigation">A propos</a>

                </nav>
            </article>
        </footer>
    )
}