import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BookCard from '../components/common/BookCard';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useBooks } from '../hooks/useBooks';

const Shop = () => {
  const { books, loading, error } = useBooks();
  const { isAuthenticated } = useAuth();
  const { cart, error: cartError, addItem, removeItem } = useCart();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [actionMessage, setActionMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const initialCategory = searchParams.get('category');
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [searchParams]);

  const filteredBooks = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim();
    return books.filter((book) => {
      const matchText = `${book.title} ${book.author}`.toLowerCase().includes(normalizedSearch);
      const matchCategory = category === 'All' || book.categoryName === category;
      return matchText && matchCategory;
    });
  }, [books, search, category]);

  const handleAddToCart = async (bookId) => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent('/shop')}`);
      return;
    }
    try {
      await addItem(bookId);
      setActionMessage('Added to cart.');
    } catch (err) {
      setActionMessage(err.message || 'Unable to add item to cart.');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeItem(itemId);
    } catch (err) {
      setActionMessage(err.message || 'Unable to remove item.');
    }
  };

  return (
    <main className="section">
      <div className="container">
        <h1>Shop All Books</h1>
        <div className="shop-toolbar">
          <input
            type="search"
            placeholder="Search by title or author..."
            aria-label="Search books"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            aria-label="Filter by category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Fiction">Fiction</option>
            <option value="Non-Fiction">Non-Fiction</option>
            <option value="Manga">Manga</option>
            <option value="Comics">Comics</option>
            <option value="Novels">Novels</option>
          </select>
        </div>

        {loading && <p>Loading books...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && (
          <div className="card-grid">
            {filteredBooks.length ? (
              filteredBooks.map((book) => <BookCard key={book.id} book={book} onAdd={handleAddToCart} />)
            ) : (
              <p>No books found for your search/filter.</p>
            )}
          </div>
        )}

        <section id="cart" className="cart-panel">
          <h2>Your Cart</h2>
          {cartError && <p style={{ color: 'crimson' }}>{cartError}</p>}
          {actionMessage && <p>{actionMessage}</p>}
          {cart.items && cart.items.length ? (
            <>
              {cart.items.map((item) => (
                <div className="cart-item" key={item.id}>
                  <span>
                    {item.title} (x{item.quantity})
                  </span>
                  <span>
                    ${Number(item.lineTotal).toFixed(2)}{' '}
                    <button className="small-btn" type="button" onClick={() => handleRemove(item.id)}>
                      Remove
                    </button>
                  </span>
                </div>
              ))}
              <p className="cart-total">
                Total: $<span>{Number(cart.total || 0).toFixed(2)}</span>
              </p>
            </>
          ) : (
            <p>Your cart is currently empty.</p>
          )}
        </section>
      </div>
    </main>
  );
};

export default Shop;
