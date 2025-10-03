import './_Mesbibliothèques.scss';

//création de l'interface pour typer l'objet
interface LibraryProfileProps {
    id: number;
    name: string;
    image:string;
}

    //Profils fictifs
   const profilePicture: LibraryProfileProps[] = [
  { id: 1, name: 'Lucas', image: "./profil/batman.webp" },
  { id: 2, name: 'Elodie', image: "./profil/hg.webp" },
  { id: 3, name: 'Jonathan', image: "./profil/thejoker.webp" },
  { id: 4, name: 'Stéphane', image: "./profil/gandalf.webp" },
];
  


const Profile = ({ name, image }: LibraryProfileProps) => (
  <div className="profil">
    <img src={image} alt={name} className='image-profil'/>
    <a className='profil-name'>{name}</a>
  </div>
);    

    export default function MesBibliothèques() {
  return (
    <div className="container-bibliothèque">
      <h1 className='biblioH1'>Mes Bibliothèques</h1>
      <div className="profils">
        {profilePicture.map((profil) => (
          <Profile key={profil.id} {...profil} />
        ))}
      </div>
    </div>
  );
};



