const placeholderImage = 'https://via.placeholder.com/500x700?text=No+Cover';

const BookCard = ({ book, onAdd }) => {
  return (
    <article className="book-card">
      <img
        src={book.coverImageUrl || placeholderImage}
        alt={`${book.title} cover`}
        loading="lazy"
      />
      <div className="book-card-content">
        <h3>{book.title}</h3>
        <p>{book.author}</p>
        <p className="price">${Number(book.price).toFixed(2)}</p>
        <button className="small-btn" type="button" onClick={() => onAdd(book.id)}>
          Add to Cart
        </button>
      </div>
    </article>
  );
};

export default BookCard;
