# 🛒 Einkaufsliste App - Anleitung

## ✨ Neue Features

### 1. 🔐 Benutzerkonten (Firebase)
- Erstellen Sie ein kostenloses Firebase-Konto
- Ihre Listen werden synchronisiert
- Von mehreren Geräten zugreifen

### 2. 📤 Liste teilen
- Tippen Sie auf das 📤 Symbol
- Senden Sie die Liste per WhatsApp, E-Mail, etc.
- Oder kopieren Sie sie in die Zwischenablage

### 3. 📷 Listen scannen (OCR)
- Fotografieren Sie handgeschriebene oder gedruckte Listen
- Automatische Texterkennung
- Unterstützt mehrere Sprachen: 🇩🇪 🇬🇧 🇫🇷 🇪🇸 🇮🇹

### 4. 🌍 Automatische Spracherkennung
- App erkennt die Sprache Ihrer gescannten Liste
- Unterstützt: Deutsch, Englisch, Französisch, Spanisch, Italienisch

## 🚀 Installation & Setup

### Schritt 1: Firebase einrichten (Optional - für Konten)

1. Gehen Sie zu: https://firebase.google.com/
2. Klicken Sie auf "Get Started" (kostenlos)
3. Erstellen Sie ein neues Projekt
4. Aktivieren Sie:
   - **Authentication** → Email/Password
   - **Realtime Database** → Im Test-Modus starten

5. Projekt-Einstellungen → Ihre Web-App hinzufügen
6. Kopieren Sie die Config-Daten
7. Fügen Sie sie in `app.js` ein (Zeile 1-9):

```javascript
const firebaseConfig = {
    apiKey: "IHRE_ECHTE_API_KEY",
    authDomain: "IHRE_AUTH_DOMAIN",
    databaseURL: "IHRE_DATABASE_URL",
    projectId: "IHRE_PROJECT_ID",
    storageBucket: "IHRE_STORAGE_BUCKET",
    messagingSenderId: "IHRE_MESSAGING_SENDER_ID",
    appId: "IHRE_APP_ID"
};
```

**Ohne Firebase:** Die App funktioniert auch ohne Firebase im Offline-Modus!

### Schritt 2: App lokal testen

1. Öffnen Sie PowerShell im Projektordner
2. Starten Sie einen Server:
   ```
   python -m http.server 8000
   ```
3. Öffnen Sie im Browser: `http://localhost:8000`

### Schritt 3: Auf iPhone installieren

#### Option A: Über lokales Netzwerk
1. Finden Sie Ihre lokale IP (PowerShell: `ipconfig`)
2. Öffnen Sie auf iPhone in Safari: `http://IHRE-IP:8000`
3. Tippen Sie auf "Teilen" → "Zum Home-Bildschirm"

#### Option B: Online hosten (Empfohlen)

**GitHub Pages (kostenlos):**
1. Erstellen Sie ein GitHub-Konto
2. Erstellen Sie ein neues Repository
3. Laden Sie alle Dateien hoch
4. Settings → Pages → Branch: main → Save
5. Ihre App ist online unter: `https://username.github.io/repository`

**Netlify/Vercel (kostenlos):**
1. Laden Sie alle Dateien hoch
2. Automatische URL erhalten
3. HTTPS & schnelle Ladezeiten

## 📱 Verwendung

### Listen scannen:
1. Tippen Sie auf das 📷 Kamera-Symbol
2. Erlauben Sie Kamera-Zugriff (bei erster Nutzung)
3. Fotografieren Sie Ihre Liste
4. Oder laden Sie ein Bild hoch
5. Warten Sie auf die Texterkennung
6. Tippen Sie auf "Alle hinzufügen"

### Liste teilen:
1. Tippen Sie auf das 📤 Symbol
2. Wählen Sie, wie Sie teilen möchten
3. Die Liste wird als Text geteilt

### Mit Konto synchronisieren:
1. Registrieren Sie sich mit E-Mail/Passwort
2. Ihre Listen werden automatisch gespeichert
3. Melden Sie sich auf anderen Geräten an
4. Alle Listen sind überall verfügbar

## ⚠️ Wichtige Hinweise

### Kamera-Zugriff:
- Funktioniert nur über HTTPS oder localhost
- Safari auf iPhone benötigt Berechtigungen

### Ohne Konto:
- Daten werden nur lokal gespeichert
- Beim Löschen der Browser-Daten gehen Listen verloren

### Scan-Qualität:
- Gute Beleuchtung verwenden
- Text sollte klar lesbar sein
- Handschrift funktioniert besser in Druckbuchstaben

## 🆘 Problemlösung

**Kamera funktioniert nicht:**
- Nur über HTTPS oder localhost möglich
- Berechtigungen in Browser-Einstellungen prüfen
- Alternativ: "Bild hochladen" verwenden

**Login funktioniert nicht:**
- Firebase Config korrekt eingefügt?
- Internet-Verbindung vorhanden?
- Ohne Firebase: "Ohne Anmeldung fortfahren"

**Scan erkennt nichts:**
- Bessere Beleuchtung
- Klarerer Kontrast
- Größeren Text
- Bild hochladen statt Kamera

## 💡 Tipps

1. **Beste Scan-Ergebnisse:** Foto bei Tageslicht, klarer Hintergrund
2. **Schneller arbeiten:** "Enter"-Taste zum Hinzufügen
3. **Listen organisieren:** Erledigte sofort abhaken
4. **Teilen:** Familie kann Liste empfangen und eigene App nutzen

## 🎉 Viel Spaß mit Ihrer App!
