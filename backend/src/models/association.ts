import { Authors } from "./Authors.js";
import { Books } from "./Books.js";
import { Genre } from "./Genre.js";
import { Library } from "./Library.js";
import { Notice } from "./Notice.js";
import { Permissions } from "./Permissions.js";
import { Rate } from "./Rate.js";
import { ReadingList } from "./ReadingList.js";
import { Role } from "./Role.js";
import { User } from "./user.js";

//ASSOCIATION MANY TO MANY (N-N)

//Table USER_ROLE - Un utilisateur peut avoir plusieurs rôles
User.belongsToMany(Role, {
  foreignKey: "id_user",
  otherKey: "id_role",
  as: "roles", // Plus simple et plus clair
  through: "USER_ROLE",
});

Role.belongsToMany(User, {
  foreignKey: "id_role",
  otherKey: "id_user",
  as: "users", // Plus simple et plus clair
  through: "USER_ROLE",
});

//Table ROLE_PERMISSION
Role.belongsToMany(Permissions, {
  foreignKey: "id_role",
  otherKey: "id_permission",
  as: "rolehaspermission",
  through: "ROLE_PERMISSION",
});

Permissions.belongsToMany(Role, {
  foreignKey: "id_permission",
  otherKey: "id_role",
  as: "permissionhasrole",
  through: "ROLE_PERMISSION",
});

//Table BOOK_LIBRARY

Books.belongsToMany(Library, {
  foreignKey: "id_book",
  otherKey: "id_library",
  as: "bookshaslibrary",
  through: "BOOK_LIBRARY",
});

Library.belongsToMany(Books, {
  foreignKey: "id_library",
  otherKey: "id_book",
  as: "libraryhasbook",
  through: "BOOK_LIBRARY",
});

//Table BOOK_IN_LIST
Books.belongsToMany(ReadingList, {
  foreignKey: "id_book",
  otherKey: "id_reading_list",
  as: "bookhasreadinglist",
  through: "BOOK_IN_LIST",
});

ReadingList.belongsToMany(Books, {
  foreignKey: "id_reading_list",
  otherKey: "id_book",
  as: "readinglisthasbook",
  through: "BOOK_IN_LIST",
});

//TABLE BOOK_AUTHOR
Books.belongsToMany(Authors, {
  foreignKey: "id_book",
  otherKey: "id_author",
  as: "bookhasauthor",
  through: "BOOK_AUTHOR",
});

Authors.belongsToMany(Books, {
  foreignKey: "id_author",
  otherKey: "id_book",
  as: "authorshasbook",
  through: "BOOK_AUTHOR",
});

//TABLE BOOK_GENRE
Books.belongsToMany(Genre, {
  foreignKey: "id_book",
  otherKey: "id_genre",
  as: "bookhasgenre",
  through: "BOOK_GENRE",
});

Genre.belongsToMany(Books, {
  foreignKey: "id_genre",
  otherKey: "id_book",
  as: "genrehasbook",
  through: "BOOK_GENRE",
});

//ONE TO MANY (1-N), pas de through car relation directe pas de liaison

Library.belongsTo(User, {
  foreignKey: "id_user",
  as: "LibraryBelongsToUser",
});

User.hasMany(Library, {
  foreignKey: "id_user",
  as: "UserHasManyLibrary",
});

ReadingList.belongsTo(Library, {
  foreignKey: "id_library",
  as: "readinglistBelongsToLibrary",
});

Library.hasMany(ReadingList, {
  foreignKey: "id_library",
  as: "LibraryHasManyReadingList",
});

User.hasMany(ReadingList, {
  foreignKey: "id_user",
  as: "UserHasManyReadingList",
});

ReadingList.belongsTo(User, {
  foreignKey: "id_user",
  as: "ReadingListBelongsToUser",
});

ReadingList.hasMany(Rate, {
  foreignKey: "id_reading_list",
  as: "ReadingListHasManyRate",
});

Rate.belongsTo(ReadingList, {
  foreignKey: "id_reading_list",
  as: "RateBelongsToReadingList",
});

User.hasMany(Rate, {
  foreignKey: "id_user",
  as: "UserHasManyrate",
});

Rate.belongsTo(User, {
  foreignKey: "id_user",
  as: "RateBelongsToUser",
});

User.hasMany(Notice, {
  foreignKey: "id_user",
  as: "UserHasManyNotice",
});

Notice.belongsTo(User, {
  foreignKey: "id_user",
  as: "NoticeBelongsToUser",
});

Notice.belongsTo(Books, {
  foreignKey: "id_book",
  as: "NoticeBelongToBook",
});

Books.hasMany(Notice, {
  foreignKey: "id_book",
  as: "BookHasManyNotice",
});

Rate.belongsTo(Books, {
  foreignKey: "id_book",
  as: "RateBelongToBook",
});

Books.hasMany(Rate, {
  foreignKey: "id_book",
  as: "BookHasManyRate",
});


export { Authors, Books, Notice, Rate, ReadingList, Genre, Permissions, Role, User, Library}
// l'export n'est pas obligatoire car les models sont déja exportés individuellement