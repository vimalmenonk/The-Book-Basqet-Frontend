import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/layout/AdminLayout';
import { createBook, deleteBook, fetchBooks, updateBook } from '../services/booksService';
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory
} from '../services/categoriesService';
import { fetchOrders, updateOrderStatus } from '../services/ordersService';
import { clearAdminSession, getAdminToken, getAdminUser } from '../utils/adminStorage';

const STATUS_OPTIONS = ['Pending', 'Shipped', 'Delivered'];

const initialBookState = {
  id: '',
  title: '',
  author: '',
  isbn: '',
  description: '',
  price: '',
  stockQuantity: '',
  coverImageUrl: '',
  categoryId: ''
};

const initialCategoryState = {
  id: '',
  name: '',
  description: ''
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('books');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [bookForm, setBookForm] = useState(initialBookState);
  const [categoryForm, setCategoryForm] = useState(initialCategoryState);
  const token = getAdminToken();
  const user = getAdminUser();

  const welcomeText = useMemo(() => {
    return `Welcome ${user?.fullName || user?.email || 'Admin'} — manage inventory and orders.`;
  }, [user]);

  const handleLogout = () => {
    clearAdminSession();
    navigate('/admin/login');
  };

  useEffect(() => {
    if (!token || user?.role?.toLowerCase() !== 'admin') {
      handleLogout();
    }
  }, [token, user]);

  const showMessage = (text, type = '') => {
    setMessage(text);
    setMessageType(type);
  };

  const loadAll = async () => {
    if (!token) return;
    try {
      const [categoryData, bookData, orderData] = await Promise.all([
        fetchCategories(token),
        fetchBooks(token),
        fetchOrders(token)
      ]);
      setCategories(categoryData || []);
      setBooks(bookData || []);
      setOrders(orderData || []);
    } catch (err) {
      showMessage(err.message || 'Unable to load dashboard data.', 'error');
    }
  };

  useEffect(() => {
    loadAll();
  }, [token]);

  const handleBookChange = (event) => {
    const { name, value } = event.target;
    setBookForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (event) => {
    const { name, value } = event.target;
    setCategoryForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetBookForm = () => setBookForm(initialBookState);
  const resetCategoryForm = () => setCategoryForm(initialCategoryState);

  const submitBook = async (event) => {
    event.preventDefault();
    const payload = {
      title: bookForm.title.trim(),
      author: bookForm.author.trim(),
      isbn: bookForm.isbn.trim(),
      description: bookForm.description.trim(),
      price: Number(bookForm.price),
      stockQuantity: Number(bookForm.stockQuantity),
      coverImageUrl: bookForm.coverImageUrl.trim(),
      categoryId: Number(bookForm.categoryId)
    };

    try {
      if (bookForm.id) {
        await updateBook(bookForm.id, payload, token);
        showMessage('Book updated.', 'success');
      } else {
        await createBook(payload, token);
        showMessage('Book added.', 'success');
      }
      resetBookForm();
      const data = await fetchBooks(token);
      setBooks(data || []);
    } catch (err) {
      showMessage(err.message || 'Unable to save book.', 'error');
    }
  };

  const submitCategory = async (event) => {
    event.preventDefault();
    const payload = {
      name: categoryForm.name.trim(),
      description: categoryForm.description.trim()
    };

    try {
      if (categoryForm.id) {
        await updateCategory(categoryForm.id, payload, token);
        showMessage('Category updated.', 'success');
      } else {
        await createCategory(payload, token);
        showMessage('Category added.', 'success');
      }
      resetCategoryForm();
      const data = await fetchCategories(token);
      setCategories(data || []);
      const bookData = await fetchBooks(token);
      setBooks(bookData || []);
    } catch (err) {
      showMessage(err.message || 'Unable to save category.', 'error');
    }
  };

  const handleEditBook = (book) => {
    setBookForm({
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      description: book.description || '',
      price: book.price,
      stockQuantity: book.stockQuantity,
      coverImageUrl: book.coverImageUrl || '',
      categoryId: book.categoryId
    });
  };

  const handleDeleteBook = async (id) => {
    if (!confirm('Delete this book?')) return;
    try {
      await deleteBook(id, token);
      showMessage('Book deleted successfully.', 'success');
      const data = await fetchBooks(token);
      setBooks(data || []);
    } catch (err) {
      showMessage(err.message || 'Unable to delete book.', 'error');
    }
  };

  const handleEditCategory = (category) => {
    setCategoryForm({
      id: category.id,
      name: category.name,
      description: category.description || ''
    });
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await deleteCategory(id, token);
      showMessage('Category deleted successfully.', 'success');
      const data = await fetchCategories(token);
      setCategories(data || []);
      const bookData = await fetchBooks(token);
      setBooks(bookData || []);
    } catch (err) {
      showMessage(err.message || 'Unable to delete category.', 'error');
    }
  };

  const handleOrderStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status, token);
      showMessage(`Order #${orderId} updated to ${status}.`, 'success');
      const data = await fetchOrders(token);
      setOrders(data || []);
    } catch (err) {
      showMessage(err.message || 'Unable to update order.', 'error');
    }
  };

  const refreshOrders = async () => {
    try {
      const data = await fetchOrders(token);
      setOrders(data || []);
    } catch (err) {
      showMessage(err.message || 'Unable to refresh orders.', 'error');
    }
  };

  return (
    <AdminLayout>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <h1>Book Basqet</h1>
          <p className="role-label">Admin Dashboard</p>
          <nav>
            <button
              className={`tab-button ${activeTab === 'books' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveTab('books')}
            >
              Books
            </button>
            <button
              className={`tab-button ${activeTab === 'categories' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveTab('categories')}
            >
              Categories
            </button>
            <button
              className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
              type="button"
              onClick={() => setActiveTab('orders')}
            >
              Orders
            </button>
          </nav>
          <button id="adminLogoutBtn" className="btn-ghost" type="button" onClick={handleLogout}>
            Logout
          </button>
        </aside>

        <main className="admin-main">
          <header className="admin-header">
            <div>
              <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
              <p>{welcomeText}</p>
            </div>
          </header>

          <p className={`form-message ${messageType}`}>{message}</p>

          <section className={`tab-panel ${activeTab === 'books' ? 'active' : ''}`}>
            <div className="panel-grid">
              <article className="card">
                <h3>Add / Edit Book</h3>
                <form className="admin-form" onSubmit={submitBook} noValidate>
                  <input type="hidden" value={bookForm.id} readOnly />
                  <label htmlFor="bookTitle">Title</label>
                  <input
                    id="bookTitle"
                    name="title"
                    required
                    value={bookForm.title}
                    onChange={handleBookChange}
                  />

                  <label htmlFor="bookAuthor">Author</label>
                  <input
                    id="bookAuthor"
                    name="author"
                    required
                    value={bookForm.author}
                    onChange={handleBookChange}
                  />

                  <label htmlFor="bookIsbn">ISBN</label>
                  <input
                    id="bookIsbn"
                    name="isbn"
                    required
                    value={bookForm.isbn}
                    onChange={handleBookChange}
                  />

                  <label htmlFor="bookDescription">Description</label>
                  <textarea
                    id="bookDescription"
                    name="description"
                    rows="3"
                    value={bookForm.description}
                    onChange={handleBookChange}
                  />

                  <div className="input-row">
                    <div>
                      <label htmlFor="bookPrice">Price</label>
                      <input
                        id="bookPrice"
                        name="price"
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        value={bookForm.price}
                        onChange={handleBookChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="bookStock">Stock</label>
                      <input
                        id="bookStock"
                        name="stockQuantity"
                        type="number"
                        min="0"
                        required
                        value={bookForm.stockQuantity}
                        onChange={handleBookChange}
                      />
                    </div>
                  </div>

                  <label htmlFor="bookImage">Cover Image URL</label>
                  <input
                    id="bookImage"
                    name="coverImageUrl"
                    type="url"
                    value={bookForm.coverImageUrl}
                    onChange={handleBookChange}
                  />

                  <label htmlFor="bookCategory">Category</label>
                  <select
                    id="bookCategory"
                    name="categoryId"
                    required
                    value={bookForm.categoryId}
                    onChange={handleBookChange}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <div className="button-row">
                    <button type="submit" className="btn-primary">
                      Save Book
                    </button>
                    <button type="button" className="btn-ghost" onClick={resetBookForm}>
                      Cancel Edit
                    </button>
                  </div>
                </form>
              </article>

              <article className="card table-card">
                <h3>All Books</h3>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Category</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {books.length ? (
                        books.map((book) => (
                          <tr key={book.id}>
                            <td>{book.title}</td>
                            <td>{book.author}</td>
                            <td>${Number(book.price).toFixed(2)}</td>
                            <td>{book.stockQuantity}</td>
                            <td>{book.categoryName}</td>
                            <td>
                              <button className="action-btn edit" type="button" onClick={() => handleEditBook(book)}>
                                Edit
                              </button>
                              <button
                                className="action-btn delete"
                                type="button"
                                onClick={() => handleDeleteBook(book.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6">No books found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </article>
            </div>
          </section>

          <section className={`tab-panel ${activeTab === 'categories' ? 'active' : ''}`}>
            <div className="panel-grid">
              <article className="card">
                <h3>Add / Edit Category</h3>
                <form className="admin-form" onSubmit={submitCategory} noValidate>
                  <input type="hidden" value={categoryForm.id} readOnly />
                  <label htmlFor="categoryName">Name</label>
                  <input
                    id="categoryName"
                    name="name"
                    required
                    value={categoryForm.name}
                    onChange={handleCategoryChange}
                  />

                  <label htmlFor="categoryDescription">Description</label>
                  <textarea
                    id="categoryDescription"
                    name="description"
                    rows="4"
                    value={categoryForm.description}
                    onChange={handleCategoryChange}
                  />

                  <div className="button-row">
                    <button type="submit" className="btn-primary">
                      Save Category
                    </button>
                    <button type="button" className="btn-ghost" onClick={resetCategoryForm}>
                      Cancel Edit
                    </button>
                  </div>
                </form>
              </article>

              <article className="card table-card">
                <h3>All Categories</h3>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.length ? (
                        categories.map((category) => (
                          <tr key={category.id}>
                            <td>{category.name}</td>
                            <td>{category.description || '-'}</td>
                            <td>
                              <button
                                className="action-btn edit"
                                type="button"
                                onClick={() => handleEditCategory(category)}
                              >
                                Edit
                              </button>
                              <button
                                className="action-btn delete"
                                type="button"
                                onClick={() => handleDeleteCategory(category.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3">No categories found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </article>
            </div>
          </section>

          <section className={`tab-panel ${activeTab === 'orders' ? 'active' : ''}`}>
            <article className="card table-card">
              <div className="orders-heading">
                <h3>All Orders</h3>
                <button type="button" className="btn-ghost" onClick={refreshOrders}>
                  Refresh
                </button>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Items</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length ? (
                      orders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id}</td>
                          <td>{new Date(order.createdAt).toLocaleString()}</td>
                          <td>${Number(order.totalAmount).toFixed(2)}</td>
                          <td>
                            {order.items
                              .map((item) => `${item.title} x${item.quantity}`)
                              .join(', ') || '-'}
                          </td>
                          <td>
                            <select
                              value={order.status}
                              onChange={(event) => handleOrderStatusChange(order.id, event.target.value)}
                            >
                              {STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5">No orders found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        </main>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
