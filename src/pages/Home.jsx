import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BookCard from '../components/common/BookCard';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useBooks } from '../hooks/useBooks';

const Home = () => {
  const { books, loading, error } = useBooks();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [newsletterMsg, setNewsletterMsg] = useState('');
  const [newsletterError, setNewsletterError] = useState(false);

  const handleAddToCart = async (bookId) => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent('/shop')}`);
      return;
    }
    try {
      await addItem(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewsletterSubmit = (event) => {
    event.preventDefault();
    const email = event.target.elements.newsletterEmail.value.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNewsletterMsg('Please enter a valid email.');
      setNewsletterError(true);
      return;
    }

    setNewsletterMsg('Subscribed successfully!');
    setNewsletterError(false);
    event.target.reset();
  };

  return (
    <main>
      <section className="hero section">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Welcome to Book Basqet</p>
            <h1>Discover Your Next Favorite Book</h1>
            <p>
              Explore thousands of books, novels, manga, comics, and storybooks curated for every kind of reader.
            </p>
            <Link to="/shop" className="btn btn-primary">
              Shop Now
            </Link>
          </div>
          <div className="hero-image-card">
            <img
              src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80"
              alt="Books stacked on a shelf"
              loading="lazy"
              decoding="async"
              width="900"
              height="600"
            />
          </div>
        </div>
      </section>

      <section className="section" id="featured">
        <div className="container">
          <h2>Featured Books</h2>
          {loading && <p>Loading featured books...</p>}
          {error && <p>{error}</p>}
          {!loading && !error && (
            <div className="card-grid" id="featuredBooks">
              {books.slice(0, 3).map((book) => (
                <BookCard key={book.id} book={book} onAdd={handleAddToCart} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section alt-bg">
        <div className="container">
          <h2>Browse Categories</h2>
          <div className="category-chips">
            {['Fiction', 'Non-Fiction', 'Manga', 'Comics', 'Novels'].map((category) => (
              <Link key={category} to={`/shop?category=${encodeURIComponent(category)}`}>
                {category}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Why Choose Book Basqet</h2>
          <div className="features-grid">
            <article>
              <i className="fa-solid fa-truck-fast" />
              <h3>Fast Delivery</h3>
              <p>Get your favorite reads delivered quickly and safely to your doorstep.</p>
            </article>
            <article>
              <i className="fa-solid fa-tags" />
              <h3>Great Prices</h3>
              <p>Enjoy affordable prices, seasonal discounts, and special bundle offers.</p>
            </article>
            <article>
              <i className="fa-solid fa-star" />
              <h3>Curated Picks</h3>
              <p>Handpicked collections from bestsellers to hidden gems.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section alt-bg">
        <div className="container">
          <h2>Customer Testimonials</h2>
          <div className="testimonials-grid">
            <blockquote>
              “Book Basqet made me fall in love with reading again. Amazing selection!” <cite>— Ayesha K.</cite>
            </blockquote>
            <blockquote>
              “I found rare manga volumes here that I couldn’t find elsewhere.” <cite>— Daniel T.</cite>
            </blockquote>
            <blockquote>
              “Smooth checkout, fast shipping, and beautiful packaging.” <cite>— Priya M.</cite>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container newsletter">
          <h2>Join Our Newsletter</h2>
          <p>Get weekly recommendations and exclusive discounts.</p>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input type="email" name="newsletterEmail" placeholder="Enter your email" aria-label="Email" required />
            <button type="submit" className="btn btn-primary">
              Subscribe
            </button>
          </form>
          <small style={{ color: newsletterError ? 'crimson' : 'green' }}>{newsletterMsg}</small>
        </div>
      </section>
    </main>
  );
};

export default Home;
