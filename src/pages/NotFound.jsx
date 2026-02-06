import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <main className="section">
      <div className="container prose">
        <h1>Page Not Found</h1>
        <p>The page you requested could not be found.</p>
        <Link className="btn btn-primary" to="/">
          Return Home
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
