import './ListCard.scss';

interface ListCardProps {
  id: number;
  title: string;
  description: string;
  bookCount: number;
  username: string;
}

const ListCard = ({
  title,
  description,
  bookCount,
  username,
}: ListCardProps) => {
  return (
    <div className="list-card">
      <h3>{title}</h3>
      <p className="description">{description}</p>
      <div className="list-info">
        <div className="book-count">{bookCount} livres</div>
        <div className="username">Par {username}</div>
      </div>
    </div>
  );
};

export default ListCard;
