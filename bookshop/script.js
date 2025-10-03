/* script.js
   Uses localStorage as a simple DB so admin.html and index.html share the same data in this browser.
*/

const STORAGE_KEY = 'unn_bookshop_books_v1';

// sample initial data (used if storage is empty or reset)
const SAMPLE_BOOKS = [
  { id: 1, title: "Engineering Mathematics", author: "K.A. Stroud", edition: "4th", course: "ENG201", qty: 6, lastUpdated: new Date().toISOString() },
  { id: 2, title: "Organic Chemistry", author: "Morrison & Boyd", edition: "7th", course: "CHEM101", qty: 0, lastUpdated: new Date().toISOString() },
  { id: 3, title: "Intro to Computer Science", author: "C.S. French", edition: "3rd", course: "CSC110", qty: 3, lastUpdated: new Date().toISOString() }
];

function readStore(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(!raw) return null;
  try { return JSON.parse(raw); } catch(e){ console.error('Bad store', e); return null;}
}
function saveStore(arr){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function ensureInit(){
  if(!readStore()){
    saveStore(SAMPLE_BOOKS.slice());
  }
}

// ---------- Student page functions ----------
function initStudent(){
  ensureInit();
  const searchBox = document.getElementById(' searchBox') || document.getElementById('searchBox');
  const clearBtn = document.getElementById('clearBtn');
  const resultList = document.getElementById('resultList');

  function renderList(list){
    resultList.innerHTML = '';
    if(list.length === 0){
      resultList.innerHTML = '<div class="card small-muted">No books found.</div>';
      return;
    }
    list.forEach(book => {
      const node = document.createElement('div');
      node.className = 'book-card';
      const meta = document.createElement('div');
      meta.className = 'book-meta';
      meta.innerHTML = `<p class="book-title">${escapeHtml(book.title)}</p>
                        <div class="book-sub">${escapeHtml(book.author)} ${book.edition? '• ' + escapeHtml(book.edition):''}
                        ${book.course? '<br/><span class="small-muted">Course: '+escapeHtml(book.course)+'</span>':''}</div>`;
      const right = document.createElement('div');
      const statusSpan = document.createElement('div');
      statusSpan.className = 'status ' + (book.qty > 0 ? 'available':'out');
      statusSpan.textContent = book.qty > 0 ? `✅ Available — ${book.qty} copy(ies)` : '❌ Out of stock';
      const updated = document.createElement('div');
      updated.className = 'small-muted';
      updated.style.marginTop = '6px';
      updated.textContent = 'Last update: ' + new Date(book.lastUpdated).toLocaleString();
      right.appendChild(statusSpan);
      right.appendChild(updated);

      node.appendChild(meta);
      node.appendChild(right);
      resultList.appendChild(node);
    });
  }

  function runSearch(){
    const q = (searchBox.value || '').trim().toLowerCase();
    const all = readStore() || [];
    if(!q){
      renderList(all);
      return;
    }
    const filtered = all.filter(b => 
      (b.title && b.title.toLowerCase().includes(q)) ||
      (b.author && b.author.toLowerCase().includes(q)) ||
      (b.course && b.course.toLowerCase().includes(q))
    );
    renderList(filtered);
  }

  // wiring
  searchBox.addEventListener('input', runSearch);
  clearBtn.addEventListener('click', ()=>{
    searchBox.value = '';
    runSearch();
  });

  // initial render
  runSearch();

  // keep the student view updated if admin changes data in another tab/window
  window.addEventListener('storage', runSearch);
}

// ---------- Admin page functions ----------
function initAdmin(){
  ensureInit();
  const a_title = document.getElementById('a_title');
  const a_author = document.getElementById('a_author');
  const a_course = document.getElementById('a_course');
  const a_edition = document.getElementById('a_edition');
  const a_qty = document.getElementById('a_qty');
  const addBtn = document.getElementById('addBookBtn');
  const adminList = document.getElementById('adminList');
  const clearStoreBtn = document.getElementById('clearStoreBtn');

  function renderAdmin(){
    const books = readStore() || [];
    adminList.innerHTML = '';
    if(books.length === 0){
      adminList.innerHTML = '<div class="card small-muted">No books in store.</div>';
      return;
    }
    books.forEach((b, idx) => {
      const node = document.createElement('div');
      node.className = 'book-card';
      node.innerHTML = `
        <div class="book-meta">
          <div class="book-title">${escapeHtml(b.title)}</div>
          <div class="book-sub">${escapeHtml(b.author)} ${b.edition? '• ' + escapeHtml(b.edition):''}
           ${b.course? '<br/><span class="small-muted">Course: ' + escapeHtml(b.course) + '</span>':''}
          </div>
          <div class="small-muted">Last update: ${new Date(b.lastUpdated).toLocaleString()}</div>
        </div>
        <div style="text-align:right;">
          <div class="small-muted">Qty: <strong>${b.qty}</strong></div>
          <div style="margin-top:8px;">
            <button class="inline-btn" data-act="edit" data-id="${b.id}">Edit</button>
            <button class="inline-btn" data-act="del" data-id="${b.id}">Delete</button>
          </div>
        </div>`;
      adminList.appendChild(node);
    });

    // attach listeners
    adminList.querySelectorAll('button[data-act]').forEach(btn => {
      btn.addEventListener('click', (e)=>{
        const act = btn.getAttribute('data-act');
        const id = Number(btn.getAttribute('data-id'));
        if(act === 'del') return removeBook(id);
        if(act === 'edit') return openEditDialog(id);
      });
    });
  }

  function addBook(){
    const title = (a_title.value || '').trim();
    const author = (a_author.value || '').trim();
    const course = (a_course.value || '').trim();
    const edition = (a_edition.value || '').trim();
    const qty = parseInt(a_qty.value || '0', 10);

    if(!title || !author){
      alert('Please provide at least title and author.');
      return;
    }

    const books = readStore() || [];
    const newBook = {
      id: Date.now(),
      title, author, course, edition, qty: isNaN(qty) ? 0 : qty,
      lastUpdated: new Date().toISOString()
    };
    books.unshift(newBook);
    saveStore(books);
    renderAdmin();
    // clear form
    a_title.value = a_author.value = a_course.value = a_edition.value = a_qty.value = '';
  }

  function removeBook(id){
    if(!confirm('Delete this book?')) return;
    let books = readStore() || [];
    books = books.filter(b => b.id !== id);
    saveStore(books);
    renderAdmin();
  }

  function openEditDialog(id){
    const books = readStore() || [];
    const book = books.find(b => b.id === id);
    if(!book) return;
    // simple prompt-based editing for the demo
    const newQty = prompt('Set new quantity (0 = out of stock):', book.qty);
    if(newQty === null) return;
    const qtyNum = parseInt(newQty,10);
    if(isNaN(qtyNum) || qtyNum < 0){ alert('Invalid quantity'); return; }
    book.qty = qtyNum;
    book.lastUpdated = new Date().toISOString();
    saveStore(books);
    renderAdmin();
  }

  function resetToSample(){
    if(!confirm('Reset data to sample books? This will overwrite current store.')) return;
    saveStore(SAMPLE_BOOKS.slice());
    renderAdmin();
  }

  // wiring
  addBtn.addEventListener('click', addBook);
  clearStoreBtn.addEventListener('click', resetToSample);

  // initial render
  renderAdmin();

  // keep admin view updated if other tabs make changes
  window.addEventListener('storage', renderAdmin);
}

// ---------- Utility ----------
function escapeHtml(str = ''){
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;');
}

// detect page and init
document.addEventListener('DOMContentLoaded', ()=>{
  if(document.getElementById('student-app')) initStudent();
  if(document.getElementById('admin-app')) initAdmin();
});
