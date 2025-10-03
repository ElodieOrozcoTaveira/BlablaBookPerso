import MyBooks from "../MyBooks/MyBooks";
import MyLists from "../MyLists/MyLists";

export default function MaBiblio() {
  return (
    <>
      <MyBooks max={7}/> {/*ajout de la prop pour que dans library s'affiche max 7 livres */}
      <MyLists />
    </>
  );
}
