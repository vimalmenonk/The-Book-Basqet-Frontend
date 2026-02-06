import { useCallback, useEffect, useState } from 'react';
import { fetchBooks } from '../services/booksService';

export const useBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadBooks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchBooks();
      setBooks(data || []);
    } catch (err) {
      setError(err.message || 'Unable to load books.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  return { books, loading, error, reload: loadBooks };
};
