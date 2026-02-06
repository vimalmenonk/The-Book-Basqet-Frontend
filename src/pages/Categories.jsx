import { Link } from 'react-router-dom';

const categories = [
  {
    name: 'Fiction',
    description: 'Imaginative narratives and compelling stories.'
  },
  {
    name: 'Non-Fiction',
    description: 'Learn from biographies, history, and real-world insights.'
  },
  {
    name: 'Manga',
    description: 'Dynamic Japanese comics with stunning art styles.'
  },
  {
    name: 'Comics',
    description: 'Superheroes, adventures, and illustrated fun.'
  },
  {
    name: 'Novels',
    description: 'Classic and modern long-form storytelling.'
  }
];

const Categories = () => {
  return (
    <main className="section">
      <div className="container">
        <h1>Book Categories</h1>
        <p>Explore genres tailored for every reader.</p>
        <div className="categories-grid">
          {categories.map((category) => (
            <Link
              className="category-card"
              key={category.name}
              to={`/shop?category=${encodeURIComponent(category.name)}`}
            >
              <h3>{category.name}</h3>
              <p>{category.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Categories;
