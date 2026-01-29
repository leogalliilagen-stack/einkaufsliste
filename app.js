// Firebase Configuration (WICHTIG: Eigene Firebase-Daten einfügen!)
const firebaseConfig = {
    apiKey: "IHRE_API_KEY",
    authDomain: "IHRE_AUTH_DOMAIN",
    databaseURL: "IHRE_DATABASE_URL",
    projectId: "IHRE_PROJECT_ID",
    storageBucket: "IHRE_STORAGE_BUCKET",
    messagingSenderId: "IHRE_MESSAGING_SENDER_ID",
    appId: "IHRE_APP_ID"
};

// Firebase initialisieren (nur wenn config vorhanden)
let firebaseEnabled = false;
try {
    if (firebaseConfig.apiKey !== "IHRE_API_KEY") {
        firebase.initializeApp(firebaseConfig);
        firebaseEnabled = true;
    }
} catch (error) {
    console.log('Firebase nicht konfiguriert, läuft im Offline-Modus');
}

// Service Worker registrieren
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('Service Worker registriert'))
        .catch(err => console.log('Service Worker Fehler:', err));
}

// DOM Elemente
const loginScreen = document.getElementById('loginScreen');
const mainApp = document.getElementById('mainApp');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const skipLoginBtn = document.getElementById('skipLoginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const shareBtn = document.getElementById('shareBtn');
const loginError = document.getElementById('loginError');
const userInfo = document.getElementById('userInfo');

const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const darkModeBtn = document.getElementById('darkModeBtn');
const itemInput = document.getElementById('itemInput');
const categorySelect = document.getElementById('categorySelect');
const addBtn = document.getElementById('addBtn');
const scanBtn = document.getElementById('scanBtn');
const sortSelect = document.getElementById('sortSelect');

const shoppingList = document.getElementById('shoppingList');
const emptyState = document.getElementById('emptyState');
const clearCompletedBtn = document.getElementById('clearCompleted');
const statsBtn = document.getElementById('statsBtn');
const totalItemsSpan = document.getElementById('totalItems');
const checkedItemsSpan = document.getElementById('checkedItems');

const cameraModal = document.getElementById('cameraModal');
const statsModal = document.getElementById('statsModal');
const closeCameraBtn = document.getElementById('closeCameraBtn');
const cameraPreview = document.getElementById('cameraPreview');
const captureBtn = document.getElementById('captureBtn');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('canvas');
const scanResult = document.getElementById('scanResult');

const favoritesList = document.getElementById('favoritesList');
const tabs = document.querySelectorAll('.tab');

// Globale Variablen
let currentUser = null;
let items = [];
let favorites = [];
let cameraStream = null;
let currentTab = 'active';
let itemHistory = {};

// Category Icons
const categoryIcons = {
    'Obst & Gemüse': '🥬',
    'Fleisch & Fisch': '🥩',
    'Milchprodukte': '🥛',
    'Brot & Backwaren': '🍞',
    'Getränke': '🥤',
    'Haushalt': '🧹',
    'Sonstiges': '📦'
};

// App initialisieren
init();

function init() {
    loadFavorites();
    loadItemHistory();
    loadDarkMode();
    
    // Prüfen ob User eingeloggt ist
    if (firebaseEnabled) {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                currentUser = user;
                showMainApp();
                loadItemsFromFirebase();
            } else {
                showLoginScreen();
            }
        });
    } else {
        // Offline-Modus
        showMainApp();
        loadItemsFromLocalStorage();
    }
}

function showLoginScreen() {
    loginScreen.style.display = 'flex';
    mainApp.style.display = 'none';
}

function showMainApp() {
    loginScreen.style.display = 'none';
    mainApp.style.display = 'block';
    
    if (currentUser) {
        userInfo.textContent = `Angemeldet als: ${currentUser.email}`;
    } else {
        userInfo.textContent = 'Offline-Modus';
        logoutBtn.style.display = 'none';
    }
    
    renderFavorites();
    renderList();
    updateStats();
}

// ===== AUTH =====
loginBtn.addEventListener('click', login);
registerBtn.addEventListener('click', register);
skipLoginBtn.addEventListener('click', () => {
    showMainApp();
    loadItemsFromLocalStorage();
});
logoutBtn.addEventListener('click', logout);

async function login() {
    if (!firebaseEnabled) return;
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        loginError.textContent = '';
    } catch (error) {
        loginError.textContent = getErrorMessage(error.code);
    }
}

async function register() {
    if (!firebaseEnabled) return;
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    if (password.length < 6) {
        loginError.textContent = 'Passwort muss mindestens 6 Zeichen lang sein';
        return;
    }
    
    try {
        await firebase.auth().createUserWithEmailAndPassword(email, password);
        loginError.textContent = '';
    } catch (error) {
        loginError.textContent = getErrorMessage(error.code);
    }
}

async function logout() {
    if (!firebaseEnabled) return;
    
    try {
        await firebase.auth().signOut();
        currentUser = null;
        items = [];
        showLoginScreen();
    } catch (error) {
        alert('Fehler beim Abmelden');
    }
}

function getErrorMessage(code) {
    const messages = {
        'auth/email-already-in-use': 'E-Mail wird bereits verwendet',
        'auth/invalid-email': 'Ungültige E-Mail',
        'auth/user-not-found': 'Benutzer nicht gefunden',
        'auth/wrong-password': 'Falsches Passwort',
        'auth/weak-password': 'Passwort zu schwach'
    };
    return messages[code] || 'Ein Fehler ist aufgetreten';
}

// ===== MAIN FEATURES =====
addBtn.addEventListener('click', addItem);
itemInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addItem();
});
clearCompletedBtn.addEventListener('click', clearCompleted);
shareBtn.addEventListener('click', shareList);
statsBtn.addEventListener('click', openStatsModal);
darkModeBtn.addEventListener('click', toggleDarkMode);

// Search & Filter
searchInput.addEventListener('input', filterItems);
categoryFilter.addEventListener('change', filterItems);
sortSelect.addEventListener('change', sortItems);

// Tabs
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentTab = tab.dataset.tab;
        renderList();
    });
});

// Scanner Event Listeners
scanBtn.addEventListener('click', openCamera);
closeCameraBtn.addEventListener('click', closeCamera);
captureBtn.addEventListener('click', captureAndScan);
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileUpload);

function addItem() {
    const text = itemInput.value.trim();
    
    if (text === '') return;
    
    const category = categorySelect.value;
    const item = {
        id: Date.now() + Math.random(),
        text: text,
        category: category,
        checked: false,
        isFavorite: false,
        createdAt: Date.now()
    };
    
    items.unshift(item);
    updateItemHistory(text);
    
    if (currentUser && firebaseEnabled) {
        saveToFirebase();
    } else {
        saveToLocalStorage();
        renderList();
        updateStats();
    }
    
    itemInput.value = '';
    itemInput.focus();
}

function renderList() {
    let filteredItems = getFilteredItems();
    
    shoppingList.innerHTML = '';
    
    if (filteredItems.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    filteredItems.forEach(item => {
        const li = document.createElement('li');
        li.className = `shopping-item ${item.checked ? 'checked' : ''}`;
        li.innerHTML = `
            <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="toggleItem(${item.id})">
            <div class="item-content">
                <div class="item-text">${item.text}</div>
                <div class="item-category">
                    ${categoryIcons[item.category]} ${item.category}
                </div>
            </div>
            <span class="favorite-icon ${item.isFavorite ? '' : 'inactive'}" onclick="toggleFavorite(${item.id})">
                ${item.isFavorite ? '⭐' : '☆'}
            </span>
            <button class="delete-btn" onclick="deleteItem(${item.id})">Löschen</button>
        `;
        shoppingList.appendChild(li);
    });
}

function getFilteredItems() {
    let filtered = items;
    
    // Tab Filter
    if (currentTab === 'active') {
        filtered = filtered.filter(i => !i.checked);
    } else if (currentTab === 'completed') {
        filtered = filtered.filter(i => i.checked);
    } else if (currentTab === 'favorites') {
        filtered = filtered.filter(i => i.isFavorite);
    }
    
    // Search Filter
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm) {
        filtered = filtered.filter(i => i.text.toLowerCase().includes(searchTerm));
    }
    
    // Category Filter
    const category = categoryFilter.value;
    if (category !== 'all') {
        filtered = filtered.filter(i => i.category === category);
    }
    
    // Sort
    const sortBy = sortSelect.value;
    if (sortBy === 'newest') {
        filtered.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortBy === 'oldest') {
        filtered.sort((a, b) => a.createdAt - b.createdAt);
    } else if (sortBy === 'name') {
        filtered.sort((a, b) => a.text.localeCompare(b.text));
    } else if (sortBy === 'category') {
        filtered.sort((a, b) => a.category.localeCompare(b.category));
    }
    
    return filtered;
}

function filterItems() {
    renderList();
}

function sortItems() {
    renderList();
}

function toggleItem(id) {
    const item = items.find(i => i.id === id);
    if (item) {
        item.checked = !item.checked;
        
        if (currentUser && firebaseEnabled) {
            saveToFirebase();
        } else {
            saveToLocalStorage();
            renderList();
            updateStats();
        }
    }
}

function deleteItem(id) {
    const itemEl = event.target.closest('.shopping-item');
    itemEl.classList.add('removing');
    
    setTimeout(() => {
        items = items.filter(i => i.id !== id);
        
        if (currentUser && firebaseEnabled) {
            saveToFirebase();
        } else {
            saveToLocalStorage();
            renderList();
            updateStats();
        }
    }, 300);
}

function toggleFavorite(id) {
    const item = items.find(i => i.id === id);
    if (item) {
        item.isFavorite = !item.isFavorite;
        
        if (item.isFavorite) {
            if (!favorites.includes(item.text)) {
                favorites.push(item.text);
                saveFavorites();
                renderFavorites();
            }
        }
        
        if (currentUser && firebaseEnabled) {
            saveToFirebase();
        } else {
            saveToLocalStorage();
            renderList();
            updateStats();
        }
    }
}

function clearCompleted() {
    const checkedCount = items.filter(i => i.checked).length;
    
    if (checkedCount === 0) {
        alert('Keine erledigten Artikel vorhanden');
        return;
    }
    
    if (confirm(`${checkedCount} erledigte Artikel löschen?`)) {
        items = items.filter(i => !i.checked);
        
        if (currentUser && firebaseEnabled) {
            saveToFirebase();
        } else {
            saveToLocalStorage();
            renderList();
            updateStats();
        }
    }
}

function updateStats() {
    const total = items.length;
    const checked = items.filter(i => i.checked).length;
    const unchecked = total - checked;
    const favCount = items.filter(i => i.isFavorite).length;
    
    totalItemsSpan.textContent = `${total} ${total === 1 ? 'Artikel' : 'Artikel'}`;
    checkedItemsSpan.textContent = `${checked} erledigt`;
    
    document.getElementById('activeCount').textContent = unchecked;
    document.getElementById('completedCount').textContent = checked;
    document.getElementById('favCount').textContent = favCount;
}

// ===== FAVORITES =====
function renderFavorites() {
    favoritesList.innerHTML = '';
    
    // Kombiniere favorites und häufigste Items
    const topItems = getTopItems(8);
    const displayFavorites = [...new Set([...favorites, ...topItems])].slice(0, 10);
    
    displayFavorites.forEach(fav => {
        const div = document.createElement('div');
        div.className = 'favorite-item';
        div.textContent = fav;
        div.onclick = () => addFavoriteItem(fav);
        favoritesList.appendChild(div);
    });
}

function addFavoriteItem(text) {
    const category = categorySelect.value;
    const item = {
        id: Date.now() + Math.random(),
        text: text,
        category: category,
        checked: false,
        isFavorite: true,
        createdAt: Date.now()
    };
    
    items.unshift(item);
    updateItemHistory(text);
    
    if (currentUser && firebaseEnabled) {
        saveToFirebase();
    } else {
        saveToLocalStorage();
        renderList();
        updateStats();
    }
}

function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function loadFavorites() {
    favorites = JSON.parse(localStorage.getItem('favorites')) || [];
}

// ===== ITEM HISTORY =====
function updateItemHistory(itemText) {
    if (!itemHistory[itemText]) {
        itemHistory[itemText] = 0;
    }
    itemHistory[itemText]++;
    saveItemHistory();
}

function saveItemHistory() {
    localStorage.setItem('itemHistory', JSON.stringify(itemHistory));
}

function loadItemHistory() {
    itemHistory = JSON.parse(localStorage.getItem('itemHistory')) || {};
}

function getTopItems(count = 5) {
    return Object.entries(itemHistory)
        .sort((a, b) => b[1] - a[1])
        .slice(0, count)
        .map(entry => entry[0]);
}

// ===== DARK MODE =====
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    darkModeBtn.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDark);
}

function loadDarkMode() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        darkModeBtn.textContent = '☀️';
    }
}

// ===== STORAGE =====
function saveToLocalStorage() {
    localStorage.setItem('shoppingItems', JSON.stringify(items));
}

function loadItemsFromLocalStorage() {
    items = JSON.parse(localStorage.getItem('shoppingItems')) || [];
    renderList();
    updateStats();
}

function loadItemsFromFirebase() {
    if (!firebaseEnabled || !currentUser) return;
    
    const dbRef = firebase.database().ref('users/' + currentUser.uid + '/items');
    dbRef.on('value', (snapshot) => {
        const data = snapshot.val();
        items = data ? Object.values(data) : [];
        renderList();
        updateStats();
    });
}

function saveToFirebase() {
    if (!firebaseEnabled || !currentUser) {
        saveToLocalStorage();
        return;
    }
    
    const dbRef = firebase.database().ref('users/' + currentUser.uid + '/items');
    dbRef.set(items.reduce((obj, item) => {
        obj[item.id] = item;
        return obj;
    }, {}));
}

// ===== SHARE =====
async function shareList() {
    const itemsText = items
        .filter(i => !i.checked)
        .map(item => `${categoryIcons[item.category]} ${item.text}`)
        .join('\n');
    
    const shareData = {
        title: 'Meine Einkaufsliste',
        text: `🛒 Einkaufsliste:\n\n${itemsText || 'Keine Artikel'}`,
    };
    
    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            await navigator.clipboard.writeText(shareData.text);
            alert('Liste in Zwischenablage kopiert!');
        }
    } catch (error) {
        console.log('Share abgebrochen');
    }
}

// ===== CAMERA & SCANNER =====
async function openCamera() {
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        });
        cameraPreview.srcObject = cameraStream;
        cameraModal.classList.add('active');
        scanResult.innerHTML = '';
        scanResult.classList.remove('active');
    } catch (error) {
        alert('Kamera-Zugriff verweigert. Verwenden Sie "Bild hochladen" stattdessen.');
    }
}

function closeCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    cameraModal.classList.remove('active');
}

async function captureAndScan() {
    const context = canvas.getContext('2d');
    canvas.width = cameraPreview.videoWidth;
    canvas.height = cameraPreview.videoHeight;
    context.drawImage(cameraPreview, 0, 0);
    
    canvas.toBlob(blob => {
        scanImage(blob);
    });
}

async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
        scanImage(file);
    }
}

async function scanImage(imageBlob) {
    scanResult.innerHTML = '<p>⏳ Scanne Bild...</p>';
    scanResult.classList.add('active');
    
    try {
        const { data: { text } } = await Tesseract.recognize(
            imageBlob,
            'deu+eng+fra+spa+ita',
            {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        scanResult.innerHTML = `<p>⏳ Scanne... ${Math.round(m.progress * 100)}%</p>`;
                    }
                }
            }
        );
        
        if (!text || text.trim().length === 0) {
            scanResult.innerHTML = '<p>❌ Kein Text erkannt</p>';
            return;
        }
        
        const detectedItems = text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 2 && line.length < 50)
            .filter(line => !/^[\d\s\-\.]+$/.test(line));
        
        if (detectedItems.length === 0) {
            scanResult.innerHTML = '<p>❌ Keine Artikel erkannt</p>';
            return;
        }
        
        const language = detectLanguage(text);
        
        scanResult.innerHTML = `
            <p><strong>✅ ${detectedItems.length} Artikel erkannt</strong></p>
            <p>🌍 Sprache: ${language}</p>
            <p style="font-size: 12px; color: var(--text-secondary);">${detectedItems.join(', ')}</p>
            <button onclick="addScannedItems(${JSON.stringify(detectedItems).replace(/"/g, '&quot;')})">
                Alle hinzufügen
            </button>
        `;
        
    } catch (error) {
        scanResult.innerHTML = '<p>❌ Fehler beim Scannen</p>';
        console.error(error);
    }
}

function detectLanguage(text) {
    const germanWords = ['und', 'der', 'die', 'das', 'mit', 'für'];
    const englishWords = ['and', 'the', 'with', 'for', 'from'];
    const frenchWords = ['et', 'le', 'la', 'de', 'avec'];
    const spanishWords = ['y', 'el', 'la', 'de', 'con'];
    
    const lowerText = text.toLowerCase();
    
    if (germanWords.some(word => lowerText.includes(word))) return '🇩🇪 Deutsch';
    if (frenchWords.some(word => lowerText.includes(word))) return '🇫🇷 Französisch';
    if (spanishWords.some(word => lowerText.includes(word))) return '🇪🇸 Spanisch';
    if (englishWords.some(word => lowerText.includes(word))) return '🇬🇧 Englisch';
    
    return '🌍 Automatisch erkannt';
}

function addScannedItems(scannedItems) {
    scannedItems.forEach(text => {
        const item = {
            id: Date.now() + Math.random(),
            text: text,
            category: 'Sonstiges',
            checked: false,
            isFavorite: false,
            createdAt: Date.now()
        };
        items.unshift(item);
        updateItemHistory(text);
    });
    
    if (currentUser && firebaseEnabled) {
        saveToFirebase();
    } else {
        saveToLocalStorage();
        renderList();
        updateStats();
    }
    
    closeCamera();
    alert(`✅ ${scannedItems.length} Artikel hinzugefügt!`);
}

// ===== STATISTICS =====
function openStatsModal() {
    const total = items.length;
    const completed = items.filter(i => i.checked).length;
    const pending = total - completed;
    const favCount = items.filter(i => i.isFavorite).length;
    
    document.getElementById('totalItemsStat').textContent = total;
    document.getElementById('completedStat').textContent = completed;
    document.getElementById('pendingStat').textContent = pending;
    document.getElementById('favoriteStat').textContent = favCount;
    
    // Category Stats
    const categoryCounts = {};
    items.forEach(item => {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });
    
    const categoryStatsEl = document.getElementById('categoryStats');
    categoryStatsEl.innerHTML = '';
    Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, count]) => {
            const div = document.createElement('div');
            div.className = 'category-stat-item';
            div.innerHTML = `
                <span>${categoryIcons[category]} ${category}</span>
                <strong>${count}</strong>
            `;
            categoryStatsEl.appendChild(div);
        });
    
    // Top Items
    const topItemsEl = document.getElementById('topItems');
    topItemsEl.innerHTML = '';
    const topItems = getTopItems(5);
    topItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'top-item';
        div.innerHTML = `
            <span class="top-item-rank">#${index + 1}</span>
            <span class="top-item-name">${item}</span>
            <span class="top-item-count">${itemHistory[item]}x</span>
        `;
        topItemsEl.appendChild(div);
    });
    
    statsModal.classList.add('active');
}

function closeStatsModal() {
    statsModal.classList.remove('active');
}
