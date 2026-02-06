const books = [
  { id: 1, title: 'The Midnight Library', author: 'Matt Haig', price: 14.99, category: 'Fiction', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=500&q=80' },
  { id: 2, title: 'Atomic Habits', author: 'James Clear', price: 18.50, category: 'Non-Fiction', image: 'https://images.unsplash.com/photo-1519682577862-22b62b24e493?auto=format&fit=crop&w=500&q=80' },
  { id: 3, title: 'Blue Lock Vol. 1', author: 'Muneyuki Kaneshiro', price: 11.75, category: 'Manga', image: 'https://images.unsplash.com/photo-1513001900722-370f803f498d?auto=format&fit=crop&w=500&q=80' },
  { id: 4, title: 'Spider-Verse', author: 'Marvel', price: 12.60, category: 'Comics', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=500&q=80' },
  { id: 5, title: 'Pride and Prejudice', author: 'Jane Austen', price: 10.20, category: 'Novels', image: 'https://images.unsplash.com/photo-1526243741027-444d633d7365?auto=format&fit=crop&w=500&q=80' },
  { id: 6, title: 'The Alchemist', author: 'Paulo Coelho', price: 9.99, category: 'Fiction', image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=500&q=80' }
];

const $ = (selector) => document.querySelector(selector);
const cartKey = 'bookBasqetCart';
const getCart = () => JSON.parse(localStorage.getItem(cartKey) || '[]');
const saveCart = (cart) => localStorage.setItem(cartKey, JSON.stringify(cart));
const updateCount = () => {
  const count = getCart().reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('#cartCount').forEach(el => el.textContent = count);
};

function addToCart(id) {
  const cart = getCart();
  const item = cart.find(x => x.id === id);
  if (item) item.qty += 1;
  else {
    const book = books.find(b => b.id === id);
    if (!book) return;
    cart.push({ id: book.id, title: book.title, price: book.price, qty: 1 });
  }
  saveCart(cart);
  updateCount();
  renderCart();
}

function removeFromCart(id) {
  const updated = getCart().filter(item => item.id !== id);
  saveCart(updated);
  updateCount();
  renderCart();
}

function createBookCard(book) {
  return `<article class="book-card">
    <img src="${book.image}" alt="${book.title} cover" loading="lazy" />
    <div class="book-card-content">
      <h3>${book.title}</h3>
      <p>${book.author}</p>
      <p class="price">$${book.price.toFixed(2)}</p>
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
  const filtered = books.filter(book => {
    const matchText = `${book.title} ${book.author}`.toLowerCase().includes(search);
    const matchCategory = category === 'All' || book.category === category;
    return matchText && matchCategory;
  });
  grid.innerHTML = filtered.map(createBookCard).join('') || '<p>No books found for your search/filter.</p>';
}

function renderCart() {
  const wrapper = $('#cartItems');
  const totalEl = $('#cartTotal');
  if (!wrapper || !totalEl) return;
  const cart = getCart();
  if (!cart.length) {
    wrapper.innerHTML = '<p>Your cart is currently empty.</p>';
    totalEl.textContent = '0.00';
    return;
  }
  wrapper.innerHTML = cart.map(item => `<div class="cart-item"><span>${item.title} (x${item.qty})</span><span>$${(item.price * item.qty).toFixed(2)} <button class="small-btn" onclick="removeFromCart(${item.id})">Remove</button></span></div>`).join('');
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  totalEl.textContent = total.toFixed(2);
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
    const msg = $('#formMsg');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (name.length < 2) return msg.textContent = 'Please enter a valid name.';
    if (!emailRegex.test(email)) return msg.textContent = 'Please enter a valid email address.';
    if (message.length < 10) return msg.textContent = 'Message should be at least 10 characters.';

    msg.textContent = 'Thank you! Your message has been submitted.';
    msg.style.color = 'green';
    form.reset();
  });
}

function setupNewsletter() {
  const form = $('#newsletterForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#newsletterEmail').value.trim();
    const msg = $('#newsletterMsg');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msg.textContent = 'Please enter a valid email.';
      msg.style.color = 'crimson';
      return;
    }
    msg.textContent = 'Subscribed successfully!';
    msg.style.color = 'green';
    form.reset();
  });
}

function setYear() {
  document.querySelectorAll('#year').forEach(el => el.textContent = new Date().getFullYear());
}

document.addEventListener('DOMContentLoaded', () => {
  setYear();
  setupMobileMenu();
  renderFeatured();
  setupFilters();
  renderShop();
  renderCart();
  setupContactForm();
  setupNewsletter();
  updateCount();
});

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
