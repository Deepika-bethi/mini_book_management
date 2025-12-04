// js/app.js
const IMAGE_URL = "https://m.media-amazon.com/images/I/71ZB18P3inL._SY522_.jpg";
const STORAGE_KEY = "domBooks_v1";

// DOM refs
const titleEl = document.getElementById("title");
const authorEl = document.getElementById("author");
const categoryEl = document.getElementById("category");
const addBtn = document.getElementById("addBtn");
const grid = document.getElementById("grid");
const sortBtn = document.getElementById("sortBtn");
const filterSelect = document.getElementById("filterSelect");

// state
let books = loadFromStorage();
let sortAsc = true;

// ensure initial render
render();

// Add book
addBtn.addEventListener("click", () => {
  const title = titleEl.value.trim();
  const author = authorEl.value.trim();
  const category = categoryEl.value;

  if (!title || !author || !category) {
    alert("Please fill Title, Author and Category.");
    return;
  }

  const book = {
    title,
    author,
    category,
    imageUrl: IMAGE_URL
  };

  books.push(book);
  saveToStorage();
  clearForm();
  render();
});

// Sort toggle
sortBtn.addEventListener("click", () => {
  sortAsc = !sortAsc;
  sortBtn.textContent = sortAsc ? "Sort A → Z" : "Sort Z → A";
  render();
});

// Filter change
filterSelect.addEventListener("change", () => {
  render();
});

// render grid
function render() {
  // clone and filter
  let toRender = [...books];

  const selected = filterSelect.value || "All";
  if (selected !== "All") {
    toRender = toRender.filter(b => b.category === selected);
  }

  // sort by title
  toRender.sort((a, b) => {
    const A = a.title.toLowerCase();
    const B = b.title.toLowerCase();
    return (A < B ? -1 : A > B ? 1 : 0) * (sortAsc ? 1 : -1);
  });

  grid.innerHTML = "";

  if (toRender.length === 0) {
    grid.innerHTML = `<div class="form-card"><p>No books to show.</p></div>`;
    return;
  }

  toRender.forEach((book, idx) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${book.imageUrl}" alt="${escapeHtml(book.title)}" />
      <h4>${escapeHtml(book.title)}</h4>
      <p class="meta">By ${escapeHtml(book.author)}</p>
      <p class="meta">Category: ${escapeHtml(book.category)}</p>
      <div class="actions">
        <button class="del" data-index="${idx}">Delete</button>
      </div>
    `;

    // delete handler (note: idx refers to filtered array index; map to actual item)
    const delBtn = card.querySelector(".del");
    delBtn.addEventListener("click", () => {
      // find index of this book in the original array by matching title+author+category
      const foundIndex = books.findIndex(b =>
        b.title === book.title && b.author === book.author && b.category === book.category
      );
      if (foundIndex > -1) {
        books.splice(foundIndex, 1);
        saveToStorage();
        render();
      }
    });

    grid.appendChild(card);
  });
}

// helpers
function clearForm() {
  titleEl.value = "";
  authorEl.value = "";
  categoryEl.value = "";
  titleEl.focus();
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
