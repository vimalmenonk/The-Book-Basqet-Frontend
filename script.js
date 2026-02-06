const $ = (selector) => document.querySelector(selector);

const API_BASE_URL = window.BOOKBASQET_API_URL || 'https://localhost:5001/api';
const TOKEN_STORAGE_KEY = 'bookBasqetJwtToken';
const TOKEN_EXP_STORAGE_KEY = 'bookBasqetJwtTokenExp';
const USER_STORAGE_KEY = 'bookBasqetAuthUser';
let books = [];
let cart = { items: [], total: 0 };

function setToken(token, expiresAt, user = null) {
  if (!token) return;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(TOKEN_EXP_STORAGE_KEY, expiresAt || '');

  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }
}

function clearToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(TOKEN_EXP_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

function getToken() {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const exp = localStorage.getItem(TOKEN_EXP_STORAGE_KEY);
  if (!token) return null;
  if (exp && new Date(exp) <= new Date()) {
    clearToken();
    return null;
  }
  return token;
}

function getAuthUser() {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }

  const token = getToken();
  if (!token) return null;

  try {
    const base64 = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/');
    if (!base64) return null;
    const claims = JSON.parse(atob(base64));

    return {
      fullName: claims.unique_name || claims.name || '',
      email: claims.email || '',
      role: claims.role || ''
    };
  } catch {
    return null;
  }
}

function showMessage(targetId, message, isError = false) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.textContent = message;
  target.style.color = isError ? 'crimson' : 'green';
}

function showGlobalError(message) {
  const areas = ['newsletterMsg', 'formMsg'];
  let shown = false;
  areas.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = message;
      el.style.color = 'crimson';
      shown = true;
    }
  });
  if (!shown) {
    console.error(message);
  }
}

async function apiRequest(path, options = {}, requiresAuth = false) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (requiresAuth) {
    const token = getToken();
    if (!token) {
      throw new Error('Please login to continue.');
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.success === false) {
    const errorMessage = payload?.message || `Request failed with status ${response.status}`;
    if (response.status === 401 || response.status === 403) {
      clearToken();
    }
    throw new Error(errorMessage);
  }

  return payload?.data;
}

async function login(email, password) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  setToken(data?.token, data?.expiresAt, {
    fullName: data?.fullName,
    email: data?.email,
    role: data?.role
  });
  return data;
}

async function register(fullName, email, password) {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName, email, password })
  });

  setToken(data?.token, data?.expiresAt, {
    fullName: data?.fullName,
    email: data?.email,
    role: data?.role
  });
  return data;
}

async function ensureAuthenticated() {
  if (getToken()) return true;

  const currentPath = `${window.location.pathname.split('/').pop() || 'index.html'}${window.location.search}${window.location.hash}`;
  window.location.href = `login.html?redirect=${encodeURIComponent(currentPath)}`;
  return false;
}

function getRedirectTarget() {
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect');
  if (!redirect || redirect.startsWith('http')) return 'shop.html';
  return redirect;
}

function logout() {
  clearToken();
  window.location.href = 'index.html';
}

function renderAuthActions() {
  const container = document.getElementById('authActions');
  if (!container) return;

  const user = getAuthUser();

  if (user && getToken()) {
    const displayName = user.fullName || user.email || 'Reader';
    container.innerHTML = `
      <span class="auth-user">Hi, ${displayName}</span>
      <button type="button" class="btn btn-secondary" id="logoutBtn">Logout</button>
    `;

    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    return;
  }

  container.innerHTML = `
    <a class="btn btn-secondary" href="login.html">Login</a>
    <a class="btn btn-primary" href="register.html">Register</a>
  `;
}

function setupAuthFormValidation() {
  const forms = document.querySelectorAll('form[novalidate]');
  forms.forEach((form) => {
    form.querySelectorAll('input').forEach((input) => {
      input.addEventListener('input', () => {
        input.setCustomValidity('');
      });
    });
  });
}

function setupLoginForm() {
  const form = $('#loginForm');
  if (!form) return;

  if (getToken()) {
    window.location.href = getRedirectTarget();
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('#loginEmail')?.value.trim() || '';
    const password = $('#loginPassword')?.value || '';
    const messageEl = $('#loginMsg');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMessage('loginMsg', 'Please enter a valid email address.', true);
      return;
    }

    if (password.length < 6) {
      showMessage('loginMsg', 'Password must be at least 6 characters.', true);
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    if (messageEl) messageEl.textContent = 'Signing you in...';

    try {
      await login(email, password);
      showMessage('loginMsg', 'Login successful. Redirecting...');
      window.location.href = getRedirectTarget();
    } catch (error) {
      showMessage('loginMsg', error.message || 'Login failed.', true);
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

function setupRegisterForm() {
  const form = $('#registerForm');
  if (!form) return;

  if (getToken()) {
    window.location.href = 'shop.html';
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullName = $('#fullName')?.value.trim() || '';
    const email = $('#registerEmail')?.value.trim() || '';
    const password = $('#registerPassword')?.value || '';
    const confirmPassword = $('#confirmPassword')?.value || '';
    const messageEl = $('#registerMsg');

    if (fullName.length < 2 || fullName.length > 120) {
      showMessage('registerMsg', 'Full name should be between 2 and 120 characters.', true);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMessage('registerMsg', 'Please enter a valid email address.', true);
      return;
    }

    if (password.length < 6) {
      showMessage('registerMsg', 'Password must be at least 6 characters.', true);
      return;
    }

    if (password !== confirmPassword) {
      showMessage('registerMsg', 'Passwords do not match.', true);
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    if (messageEl) messageEl.textContent = 'Creating your account...';

    try {
      await register(fullName, email, password);
      showMessage('registerMsg', 'Registration successful. Redirecting...');
      window.location.href = 'shop.html';
    } catch (error) {
      showMessage('registerMsg', error.message || 'Registration failed.', true);
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

function updateCount() {
  const count = (cart.items || []).reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('#cartCount').forEach((el) => {
    el.textContent = count;
  });
}

function createBookCard(book) {
  return `<article class="book-card">
    <img src="${book.coverImageUrl || 'https://via.placeholder.com/500x700?text=No+Cover'}" alt="${book.title} cover" loading="lazy" />
    <div class="book-card-content">
      <h3>${book.title}</h3>
      <p>${book.author}</p>
      <p class="price">$${Number(book.price).toFixed(2)}</p>
      <button class="small-btn" onclick="addToCart(${book.id})">Add to Cart</button>
    </div>
  </article>`;
}

function renderFeatured() {
  const el = $('#featuredBooks');
  if (!el) return;
  el.innerHTML = books.slice(0, 3).map(createBookCard).join('');
}

function renderShop() {
  const grid = $('#bookGrid');
  if (!grid) return;

  const search = ($('#searchInput')?.value || '').toLowerCase().trim();
  const category = $('#categoryFilter')?.value || 'All';

  const filtered = books.filter((book) => {
    const matchText = `${book.title} ${book.author}`.toLowerCase().includes(search);
    const matchCategory = category === 'All' || book.categoryName === category;
    return matchText && matchCategory;
  });

  grid.innerHTML = filtered.map(createBookCard).join('') || '<p>No books found for your search/filter.</p>';
}

function renderCart() {
  const wrapper = $('#cartItems');
  const totalEl = $('#cartTotal');
  if (!wrapper || !totalEl) return;

  if (!cart.items || !cart.items.length) {
    wrapper.innerHTML = '<p>Your cart is currently empty.</p>';
    totalEl.textContent = '0.00';
    return;
  }

  wrapper.innerHTML = cart.items.map((item) => (
    `<div class="cart-item"><span>${item.title} (x${item.quantity})</span><span>$${Number(item.lineTotal).toFixed(2)} <button class="small-btn" onclick="removeFromCart(${item.id})">Remove</button></span></div>`
  )).join('');

  totalEl.textContent = Number(cart.total || 0).toFixed(2);
}

async function loadBooks() {
  try {
    books = await apiRequest('/books');
    renderFeatured();
    renderShop();
  } catch (error) {
    const grid = $('#bookGrid');
    const featured = $('#featuredBooks');
    const message = error.message || 'Unable to load books right now.';
    if (grid) grid.innerHTML = `<p>${message}</p>`;
    if (featured) featured.innerHTML = `<p>${message}</p>`;
  }
}

async function loadCart() {
  const hasCartUi = !!$('#cartItems');
  if (!hasCartUi) return;

  try {
    if (!getToken()) {
      cart = { items: [], total: 0 };
      renderCart();
      updateCount();
      return;
    }

    cart = await apiRequest('/cart', { method: 'GET' }, true);
    renderCart();
    updateCount();
  } catch (error) {
    cart = { items: [], total: 0 };
    renderCart();
    updateCount();
    showGlobalError(error.message || 'Unable to load cart.');
  }
}

async function addToCart(bookId) {
  try {
    const isAuthed = await ensureAuthenticated();
    if (!isAuthed) return;

    cart = await apiRequest('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ bookId, quantity: 1 })
    }, true);

    renderCart();
    updateCount();
  } catch (error) {
    showGlobalError(error.message || 'Unable to add item to cart.');
  }
}

async function removeFromCart(cartItemId) {
  try {
    const isAuthed = await ensureAuthenticated();
    if (!isAuthed) return;

    await apiRequest(`/cart/items/${cartItemId}`, { method: 'DELETE' }, true);
    await loadCart();
  } catch (error) {
    showGlobalError(error.message || 'Unable to remove item from cart.');
  }
}

function setupFilters() {
  $('#searchInput')?.addEventListener('input', renderShop);
  $('#categoryFilter')?.addEventListener('change', renderShop);

  const urlCategory = new URLSearchParams(window.location.search).get('category');
  if (urlCategory && $('#categoryFilter')) {
    $('#categoryFilter').value = urlCategory;
  }
}

function setupMobileMenu() {
  const toggle = $('.menu-toggle');
  const links = $('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => links.classList.toggle('open'));
}

function setupContactForm() {
  const form = $('#contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#name').value.trim();
    const email = $('#email').value.trim();
    const message = $('#message').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (name.length < 2) return showMessage('formMsg', 'Please enter a valid name.', true);
    if (!emailRegex.test(email)) return showMessage('formMsg', 'Please enter a valid email address.', true);
    if (message.length < 10) return showMessage('formMsg', 'Message should be at least 10 characters.', true);

    showMessage('formMsg', 'Thank you! Your message has been submitted.');
    form.reset();
  });
}

function setupNewsletter() {
  const form = $('#newsletterForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#newsletterEmail').value.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMessage('newsletterMsg', 'Please enter a valid email.', true);
      return;
    }

    showMessage('newsletterMsg', 'Subscribed successfully!');
    form.reset();
  });
}

function setYear() {
  document.querySelectorAll('#year').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  setYear();
  setupMobileMenu();
  renderAuthActions();
  setupAuthFormValidation();
  setupLoginForm();
  setupRegisterForm();
  setupFilters();
  setupContactForm();
  setupNewsletter();

  await loadBooks();
  await loadCart();
});

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.logout = logout;
