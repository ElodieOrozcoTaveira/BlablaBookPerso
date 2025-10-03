import MyBooks from "../MyBooks/MyBooks";
import MyLists from "../MyLists/MyLists";
import NavBar from "../../components/common/NavBar/NavBar";

export default function MaBiblio() {
  return (
    <>
      <NavBar />
      <MyBooks />
      <MyLists />
    </>
  );
}
