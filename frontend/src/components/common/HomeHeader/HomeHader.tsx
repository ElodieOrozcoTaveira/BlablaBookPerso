import './HomeHeader.scss';
export default function HomeHeader() {
  return (
    <header className="home-header">
      <div className="home-header__faded-bg"></div>
      <img
        src="./livreouvert.webp"
        alt="Livre ouvert"
        className="home-header__openbook"
        width={947}
        height={674}
      />
      <div className="u_container home-header__container">
        <h1 className="home-header__title">Bienvenue sur BlaBlaBook</h1>
        <p className="u-main-title home-header__subtitle">
          Découvrez, organisez et partagez vos lectures
        </p>
      </div>
    </header>
  );
}
