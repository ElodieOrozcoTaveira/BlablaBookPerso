import './BookCard.scss';

interface BookCardProps {
  id: number;
  title: string;
  author: string;
  cover: string;
  rating: number;
  genre: string;
}

const BookCard = ({ title, author, cover, rating, genre }: BookCardProps) => {
  return (
    <div className="book-card">
      <img src={cover} alt={title} />
      <h3>{title}</h3>
      <p className="author">{author}</p>
      <span className="genre">{genre}</span>
      <div className="rating">⭐ {rating}</div>
    </div>
  );
};

export default BookCard;
