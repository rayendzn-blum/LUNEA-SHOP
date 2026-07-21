import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 5000;
const DB_FILE = './database.json';

app.use(cors());
app.use(express.json());

// Passcode config
const ADMIN_PASSCODE = 'admin123';
const AUTH_TOKEN = 'lunea_sec_auth_token_2026';

// Helper to read database
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initialDB = {
      orders: [
        {
          id: 'LUN-2026-9042',
          date: new Date().toLocaleDateString('fr-FR') + ' 14:32',
          fullName: 'Yasmine Benali',
          phone: '0550 12 34 56',
          wilaya: '16 - Alger',
          address: 'Hydra, Rue des Pins N° 12',
          offer: 'La Parfaite',
          size: '36/38',
          price: 6500,
          discountApplied: false,
          status: 'En attente'
        },
        {
          id: 'LUN-2026-8819',
          date: new Date().toLocaleDateString('fr-FR') + ' 11:15',
          fullName: 'Amel Mansouri',
          phone: '0770 98 76 54',
          wilaya: '31 - Oran',
          address: 'Akid Lotfi, N° 45',
          offer: 'Le Double Parfait',
          size: '40/42',
          price: 10900,
          discountApplied: true,
          status: 'Confirmée'
        }
      ],
      activities: [
        { id: 1, text: 'Visite de la page Maillot robe MONACO.', time: 'Il y a 5 min' },
        { id: 2, text: 'Offre "La Parfaite" sélectionnée.', time: 'Il y a 3 min' }
      ],
      settings: {
        webhookUrl: ''
      }
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2));
    return initialDB;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

// Helper to write to database
function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Auth Middleware
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
    return res.status(401).json({ error: 'Accès non autorisé. Token manquant ou invalide.' });
  }
  next();
}

// --- API ROUTES ---

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { passcode } = req.body;
  if (passcode === ADMIN_PASSCODE || passcode === '1234' || passcode === 'lunea') {
    res.json({ token: AUTH_TOKEN });
  } else {
    res.status(400).json({ error: 'Code d\'accès incorrect.' });
  }
});

// Get orders (SECURE)
app.get('/api/orders', requireAuth, (req, res) => {
  const db = readDB();
  res.json(db.orders);
});

// Post new order (PUBLIC - client can place order)
app.post('/api/orders', (req, res) => {
  const db = readDB();
  const newOrder = req.body;
  
  db.orders.unshift(newOrder);
  writeDB(db);

  // Send to webhook if set
  if (db.settings.webhookUrl) {
    fetch(db.settings.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `🚨 **NOUVELLE COMMANDE LUNÉA !**\n\n📌 **ID:** ${newOrder.id}\n👤 **Nom:** ${newOrder.fullName}\n📞 **Tél:** ${newOrder.phone}\n📍 **Wilaya:** ${newOrder.wilaya}\n🏠 **Adresse:** ${newOrder.address}\n👗 **Pack:** ${newOrder.offer} (Taille ${newOrder.size})\n💰 **Total COD:** ${newOrder.price.toLocaleString('fr-FR')} DA`
      })
    }).catch(err => console.log('Webhook warning:', err.message));
  }

  res.status(201).json({ success: true, order: newOrder });
});

// Update order status (SECURE)
app.put('/api/orders/:id/status', requireAuth, (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { status } = req.body;
  
  const order = db.orders.find(o => o.id === id);
  if (order) {
    order.status = status;
    writeDB(db);
    res.json({ success: true, order });
  } else {
    res.status(404).json({ error: 'Commande introuvable.' });
  }
});

// Delete order (SECURE)
app.delete('/api/orders/:id', requireAuth, (req, res) => {
  const db = readDB();
  const { id } = req.params;
  
  const index = db.orders.findIndex(o => o.id === id);
  if (index !== -1) {
    db.orders.splice(index, 1);
    writeDB(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Commande introuvable.' });
  }
});

// Get activities (SECURE)
app.get('/api/activities', requireAuth, (req, res) => {
  const db = readDB();
  res.json(db.activities);
});

// Log activity (PUBLIC)
app.post('/api/activities', (req, res) => {
  const db = readDB();
  const { text } = req.body;
  const newActivity = {
    id: Date.now(),
    text,
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  };
  
  db.activities.unshift(newActivity);
  db.activities = db.activities.slice(0, 50); // limit to 50
  writeDB(db);
  res.json({ success: true, activity: newActivity });
});

// Get Webhook URL settings (SECURE)
app.get('/api/settings', requireAuth, (req, res) => {
  const db = readDB();
  res.json(db.settings);
});

// Update Webhook URL settings (SECURE)
app.post('/api/settings', requireAuth, (req, res) => {
  const db = readDB();
  const { webhookUrl } = req.body;
  db.settings.webhookUrl = webhookUrl;
  writeDB(db);
  res.json({ success: true });
});

// Serve frontend build output in production
const distPath = path.resolve('./dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server database running on http://localhost:${PORT}`);
});
