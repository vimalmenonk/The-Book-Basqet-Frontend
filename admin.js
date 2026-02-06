const API_BASE = localStorage.getItem('bookBasqetApiBase') || 'https://localhost:5001/api';
const TOKEN_KEY = 'bookBasqetAdminToken';
const USER_KEY = 'bookBasqetAdminUser';

const STATUS_OPTIONS = ['Pending', 'Shipped', 'Delivered'];

const getToken = () => localStorage.getItem(TOKEN_KEY);
const getAdminUser = () => JSON.parse(localStorage.getItem(USER_KEY) || 'null');

function setMessage(targetId, text, type = '') {
  const el = document.getElementById(targetId);
  if (!el) return;
  el.textContent = text;
  el.className = `form-message ${type}`.trim();
}

function parseApiError(payload, fallback = 'Something went wrong.') {
  if (!payload) return fallback;
  return payload.message || payload.title || payload.error || fallback;
}

async function apiFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => null);

  if (!response.ok || (payload && payload.success === false)) {
    const message = parseApiError(payload, `Request failed (${response.status})`);
    throw new Error(message);
  }

  return payload?.data ?? payload;
}

function logoutAdmin() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = 'admin-login.html';
}

function requireAdminAccess() {
  const user = getAdminUser();
  if (!user || user.role?.toLowerCase() !== 'admin' || !getToken()) {
    window.location.href = 'admin-login.html';
    return false;
  }
  return true;
}

async function handleAdminLogin(event) {
  event.preventDefault();

  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value;

  if (!email || !password) {
    setMessage('adminLoginMessage', 'Please provide email and password.', 'error');
    return;
  }

  try {
    setMessage('adminLoginMessage', 'Signing in...');
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (data.role?.toLowerCase() !== 'admin') {
      setMessage('adminLoginMessage', 'Access denied. Admin role is required.', 'error');
      return;
    }

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify({
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      expiresAt: data.expiresAt
    }));

    window.location.href = 'admin-dashboard.html';
  } catch (error) {
    setMessage('adminLoginMessage', error.message, 'error');
  }
}

function setupTabs() {
  const buttons = document.querySelectorAll('.tab-button');
  const panels = document.querySelectorAll('.tab-panel');
  const title = document.getElementById('dashboardTitle');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(btn => btn.classList.remove('active'));
      panels.forEach(panel => panel.classList.remove('active'));

      button.classList.add('active');
      const tab = button.dataset.tab;
      document.getElementById(`tab-${tab}`).classList.add('active');
      title.textContent = tab.charAt(0).toUpperCase() + tab.slice(1);
    });
  });
}

function resetBookForm() {
  document.getElementById('bookForm').reset();
  document.getElementById('bookId').value = '';
}

function resetCategoryForm() {
  document.getElementById('categoryForm').reset();
  document.getElementById('categoryId').value = '';
}

async function loadCategories(forSelectOnly = false) {
  const categories = await apiFetch('/categories');

  const select = document.getElementById('bookCategory');
  if (select) {
    select.innerHTML = categories
      .map(category => `<option value="${category.id}">${category.name}</option>`)
      .join('');
  }

  if (forSelectOnly) return;

  const body = document.getElementById('categoriesTableBody');
  body.innerHTML = categories.map(category => `
    <tr>
      <td>${category.name}</td>
      <td>${category.description || '-'}</td>
      <td>
        <button class="action-btn edit" data-action="edit-category" data-id="${category.id}">Edit</button>
        <button class="action-btn delete" data-action="delete-category" data-id="${category.id}">Delete</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="3">No categories found.</td></tr>';

  body.querySelectorAll('[data-action="edit-category"]').forEach(button => {
    button.addEventListener('click', () => {
      const category = categories.find(item => item.id === Number(button.dataset.id));
      if (!category) return;
      document.getElementById('categoryId').value = category.id;
      document.getElementById('categoryName').value = category.name;
      document.getElementById('categoryDescription').value = category.description || '';
    });
  });

  body.querySelectorAll('[data-action="delete-category"]').forEach(button => {
    button.addEventListener('click', async () => {
      if (!confirm('Delete this category?')) return;
      try {
        await apiFetch(`/categories/${button.dataset.id}`, { method: 'DELETE' });
        setMessage('dashboardMessage', 'Category deleted successfully.', 'success');
        await loadCategories();
        await loadBooks();
      } catch (error) {
        setMessage('dashboardMessage', error.message, 'error');
      }
    });
  });
}

async function loadBooks() {
  const books = await apiFetch('/books');
  const body = document.getElementById('booksTableBody');

  body.innerHTML = books.map(book => `
    <tr>
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>$${Number(book.price).toFixed(2)}</td>
      <td>${book.stockQuantity}</td>
      <td>${book.categoryName}</td>
      <td>
        <button class="action-btn edit" data-action="edit-book" data-id="${book.id}">Edit</button>
        <button class="action-btn delete" data-action="delete-book" data-id="${book.id}">Delete</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="6">No books found.</td></tr>';

  body.querySelectorAll('[data-action="edit-book"]').forEach(button => {
    button.addEventListener('click', () => {
      const book = books.find(item => item.id === Number(button.dataset.id));
      if (!book) return;
      document.getElementById('bookId').value = book.id;
      document.getElementById('bookTitle').value = book.title;
      document.getElementById('bookAuthor').value = book.author;
      document.getElementById('bookIsbn').value = book.isbn;
      document.getElementById('bookDescription').value = book.description || '';
      document.getElementById('bookPrice').value = book.price;
      document.getElementById('bookStock').value = book.stockQuantity;
      document.getElementById('bookImage').value = book.coverImageUrl || '';
      document.getElementById('bookCategory').value = book.categoryId;
    });
  });

  body.querySelectorAll('[data-action="delete-book"]').forEach(button => {
    button.addEventListener('click', async () => {
      if (!confirm('Delete this book?')) return;
      try {
        await apiFetch(`/books/${button.dataset.id}`, { method: 'DELETE' });
        setMessage('dashboardMessage', 'Book deleted successfully.', 'success');
        await loadBooks();
      } catch (error) {
        setMessage('dashboardMessage', error.message, 'error');
      }
    });
  });
}

async function loadOrders() {
  const orders = await apiFetch('/orders');
  const body = document.getElementById('ordersTableBody');

  body.innerHTML = orders.map(order => {
    const itemSummary = order.items.map(item => `${item.title} x${item.quantity}`).join(', ');
    const statusSelect = `
      <select data-action="order-status" data-id="${order.id}">
        ${STATUS_OPTIONS.map(status => `<option value="${status}" ${order.status === status ? 'selected' : ''}>${status}</option>`).join('')}
      </select>
    `;

    return `
      <tr>
        <td>#${order.id}</td>
        <td>${new Date(order.createdAt).toLocaleString()}</td>
        <td>$${Number(order.totalAmount).toFixed(2)}</td>
        <td>${itemSummary || '-'}</td>
        <td>${statusSelect}</td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="5">No orders found.</td></tr>';

  body.querySelectorAll('[data-action="order-status"]').forEach(select => {
    select.addEventListener('change', async () => {
      try {
        await apiFetch(`/orders/${select.dataset.id}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status: select.value })
        });
        setMessage('dashboardMessage', `Order #${select.dataset.id} updated to ${select.value}.`, 'success');
      } catch (error) {
        setMessage('dashboardMessage', error.message, 'error');
        await loadOrders();
      }
    });
  });
}

async function handleBookSubmit(event) {
  event.preventDefault();
  const id = document.getElementById('bookId').value;
  const payload = {
    title: document.getElementById('bookTitle').value.trim(),
    author: document.getElementById('bookAuthor').value.trim(),
    isbn: document.getElementById('bookIsbn').value.trim(),
    description: document.getElementById('bookDescription').value.trim(),
    price: Number(document.getElementById('bookPrice').value),
    stockQuantity: Number(document.getElementById('bookStock').value),
    coverImageUrl: document.getElementById('bookImage').value.trim(),
    categoryId: Number(document.getElementById('bookCategory').value)
  };

  try {
    await apiFetch(id ? `/books/${id}` : '/books', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(payload)
    });
    setMessage('dashboardMessage', id ? 'Book updated.' : 'Book added.', 'success');
    resetBookForm();
    await loadBooks();
  } catch (error) {
    setMessage('dashboardMessage', error.message, 'error');
  }
}

async function handleCategorySubmit(event) {
  event.preventDefault();
  const id = document.getElementById('categoryId').value;
  const payload = {
    name: document.getElementById('categoryName').value.trim(),
    description: document.getElementById('categoryDescription').value.trim()
  };

  try {
    await apiFetch(id ? `/categories/${id}` : '/categories', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(payload)
    });
    setMessage('dashboardMessage', id ? 'Category updated.' : 'Category added.', 'success');
    resetCategoryForm();
    await loadCategories();
    await loadBooks();
  } catch (error) {
    setMessage('dashboardMessage', error.message, 'error');
  }
}

async function initializeDashboard() {
  if (!requireAdminAccess()) return;

  const user = getAdminUser();
  document.getElementById('adminWelcomeText').textContent = `Welcome ${user?.fullName || user?.email || 'Admin'} — manage inventory and orders.`;

  setupTabs();
  document.getElementById('adminLogoutBtn').addEventListener('click', logoutAdmin);
  document.getElementById('bookForm').addEventListener('submit', handleBookSubmit);
  document.getElementById('categoryForm').addEventListener('submit', handleCategorySubmit);
  document.getElementById('bookFormReset').addEventListener('click', resetBookForm);
  document.getElementById('categoryFormReset').addEventListener('click', resetCategoryForm);
  document.getElementById('refreshOrdersBtn').addEventListener('click', loadOrders);

  try {
    await loadCategories();
    await loadBooks();
    await loadOrders();
  } catch (error) {
    if (error.message.toLowerCase().includes('unauthorized') || error.message.toLowerCase().includes('forbidden')) {
      logoutAdmin();
      return;
    }
    setMessage('dashboardMessage', error.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.endsWith('admin-login.html')) {
    document.getElementById('adminLoginForm').addEventListener('submit', handleAdminLogin);
    return;
  }

  if (window.location.pathname.endsWith('admin-dashboard.html')) {
    initializeDashboard();
  }
});
