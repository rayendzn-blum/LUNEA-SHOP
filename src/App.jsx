import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  ShoppingBag, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Star, 
  Check, 
  Gift, 
  Clock, 
  ChevronRight, 
  X, 
  HelpCircle,
  Percent,
  Phone,
  MapPin,
  User,
  Heart,
  Award,
  LayoutDashboard,
  Download,
  Trash2,
  Edit,
  Send,
  Lock,
  Search,
  Filter,
  TrendingUp,
  BarChart3,
  ListOrdered,
  BellRing
} from 'lucide-react';
import { ALGERIA_WILAYAS } from './data/wilayas';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function App() {
  // Product gallery images
  const galleryImages = [
    { src: '/images/user_photo_1.jpg', alt: 'Mannequins LUNÉA au bord de la piscine sous parasol' },
    { src: '/images/user_photo_2.jpg', alt: 'Détail coupe galbante et volants maillot robe MONACO' },
    { src: '/images/user_photo_3.jpg', alt: 'Deux mannequins LUNÉA sous parasol Riviera' },
    { src: '/images/user_photo_4.jpg', alt: 'Mannequin LUNÉA sous parasol de station balnéaire' },
    { src: '/images/user_photo_5.jpg', alt: 'Mannequin assis au bord de la piscine turquoise' },
    { src: '/images/user_photo_6.jpg', alt: 'Duo mannequins robe maillot Riviera' },
    { src: '/images/product_detail_1.webp', alt: 'Vue de face Maillot robe MONACO' },
    { src: '/images/product_detail_2.webp', alt: 'Vue arrière et volants' }
  ];

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Offers state
  const OFFERS = [
    {
      id: 'essentielle',
      title: "L'Essentielle",
      subtitle: "1x Maillot robe MONACO.",
      price: 4900,
      originalPrice: 8900,
      savings: 4000,
      badge: null,
      freebies: ["Échange de taille gratuit", "Livraison disponible 58 Wilayas"]
    },
    {
      id: 'parfaite',
      title: "La Parfaite",
      subtitle: "Offre star recommandée par nos clientes",
      price: 6500,
      originalPrice: 8900,
      savings: 2400,
      badge: "✦ BEST-SELLER RIVIERA",
      freebies: [
        "✦ Sac de plage offert",
        "✦ Lunettes de soleil offertes",
        "✦ Échange de taille gratuit",
        "✦ Livraison GRATUITE"
      ]
    },
    {
      id: 'double_parfait',
      title: "Le Double Parfait",
      subtitle: "2x Maillots robe MONACO. (Duo Riviera)",
      price: 10900,
      originalPrice: 17800,
      savings: 6900,
      badge: "✦ PACK DUO ÉCONOMIE",
      freebies: [
        "✦ 2× Maillot robe MONACO",
        "✦ Sac de plage offert",
        "✦ 2× Échange de taille gratuit",
        "✦ Livraison GRATUITE"
      ]
    }
  ];

  const [selectedOffer, setSelectedOffer] = useState(OFFERS[1]); // Default to 'La Parfaite'
  const [selectedSize, setSelectedSize] = useState('36/38');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState('');

  // Modal states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isOrderSubmitted, setIsOrderSubmitted] = useState(false);

  // Form input state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    wilaya: '16 - Alger',
    address: '',
    notes: ''
  });

  // Calculate final total
  const finalPrice = Math.max(0, selectedOffer.price - discountAmount);

  // ==========================================
  // REAL DATABASE BACKEND REST API CONFIGURATION
  // ==========================================
  const [orders, setOrders] = useState([]);
  const [activities, setActivities] = useState([]);
  const [webhookUrl, setWebhookUrl] = useState('');
  
  // Auth Token
  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem('lunea_admin_token') || '';
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(!!authToken);
  
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [adminTab, setAdminTab] = useState('orders'); // 'orders', 'activities', 'settings'
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Fetch admin data from real database API
  const fetchAdminData = async () => {
    if (!authToken) return;
    try {
      const headers = { 'Authorization': `Bearer ${authToken}` };
      
      const ordersRes = await fetch(`${API_BASE}/api/orders`, { headers });
      if (ordersRes.status === 401) {
        handleLogout();
        return;
      }
      const ordersData = await ordersRes.json();
      setOrders(ordersData);

      const actRes = await fetch(`${API_BASE}/api/activities`, { headers });
      const actData = await actRes.json();
      setActivities(actData);

      const settingsRes = await fetch(`${API_BASE}/api/settings`, { headers });
      const settingsData = await settingsRes.json();
      setWebhookUrl(settingsData.webhookUrl || '');
    } catch (e) {
      console.error('Error fetching admin database data:', e);
    }
  };

  // Fetch data on mount and auth state change
  useEffect(() => {
    if (isAdminAuthenticated && authToken) {
      fetchAdminData();
    }
  }, [isAdminAuthenticated, authToken]);

  // Log client activity to server database
  const logActivity = async (text) => {
    try {
      await fetch(`${API_BASE}/api/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (isAdminAuthenticated) {
        fetchAdminData();
      }
    } catch (e) {
      console.error('Error logging activity to database:', e);
    }
  };

  // Log initial visit once
  useEffect(() => {
    logActivity('Visite de la page Maillot robe MONACO (Nouvelle session).');
  }, []);

  // Handle logout
  const handleLogout = () => {
    setAuthToken('');
    setIsAdminAuthenticated(false);
    localStorage.removeItem('lunea_admin_token');
  };

  // Handle admin passcode login
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: adminPasscode })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setAuthToken(data.token);
        setIsAdminAuthenticated(true);
        localStorage.setItem('lunea_admin_token', data.token);
        setAdminPasscode('');
        logActivity('Connexion réussie à l\'Espace d\'Administration.');
      } else {
        alert(data.error || 'Code d\'accès incorrect.');
      }
    } catch (err) {
      alert('Erreur de connexion au serveur de base de données.');
    }
  };

  // Handle promo code submit
  const handleApplyPromo = (e) => {
    e.preventDefault();
    const code = promoCodeInput.trim().toUpperCase();
    if (code === 'LUNEA400' || code === 'LUNEA 400') {
      setDiscountApplied(true);
      setDiscountAmount(400);
      setPromoError('');
      logActivity('Code promo LUNEA400 appliqué (-400 DA)');
    } else if (code === 'ADMIN' || code === 'ADMIN123') {
      setIsAdminOpen(true);
      setPromoCodeInput('');
    } else {
      setPromoError('Code promo invalide. Essayez LUNEA400');
    }
  };

  // Handle checkout submit
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      alert("Veuillez saisir votre nom et votre numéro de téléphone.");
      return;
    }

    const orderId = 'LUN-2026-' + Math.floor(1000 + Math.random() * 9000);
    const newOrder = {
      id: orderId,
      date: new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      fullName: formData.fullName,
      phone: formData.phone,
      wilaya: formData.wilaya,
      address: formData.address,
      offer: selectedOffer.title,
      size: selectedSize,
      price: finalPrice,
      discountApplied,
      status: 'En attente'
    };

    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      if (res.ok) {
        logActivity(`Nouvelle commande passée par la cliente : ${orderId} (${formData.fullName})`);
        if (isAdminAuthenticated) {
          fetchAdminData();
        }
        
        // Launch celebratory confetti
        confetti({
          particleCount: 140,
          spread: 80,
          origin: { y: 0.6 }
        });

        setIsOrderSubmitted(true);
      } else {
        alert('Erreur lors de la validation de la commande dans la base de données.');
      }
    } catch (err) {
      alert('Erreur réseau lors de la validation de la commande.');
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchAdminData();
        logActivity(`Statut commande ${orderId} changé en "${newStatus}"`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Order
  const handleDeleteOrder = async (orderId) => {
    if (window.confirm(`Voulez-vous vraiment supprimer définitivement la commande ${orderId} de la base de données ?`)) {
      try {
        const res = await fetch(`${API_BASE}/api/orders/${orderId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) {
          fetchAdminData();
          logActivity(`Commande ${orderId} supprimée de la base de données`);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Add Test Order
  const handleAddTestOrder = async () => {
    const randomWilaya = ALGERIA_WILAYAS[Math.floor(Math.random() * ALGERIA_WILAYAS.length)];
    const testId = 'LUN-TEST-' + Math.floor(100 + Math.random() * 900);
    const testOrder = {
      id: testId,
      date: new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      fullName: 'Cliente Test ' + Math.floor(Math.random() * 100),
      phone: '0661 ' + Math.floor(100000 + Math.random() * 900000),
      wilaya: `${randomWilaya.code} - ${randomWilaya.name}`,
      address: 'Centre-ville, Rue de la Plage',
      offer: OFFERS[Math.floor(Math.random() * OFFERS.length)].title,
      size: ['34', '36/38', '40/42', '44/46'][Math.floor(Math.random() * 4)],
      price: [4900, 6500, 10900][Math.floor(Math.random() * 3)],
      discountApplied: Math.random() > 0.5,
      status: 'En attente'
    };

    try {
      await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testOrder)
      });
      fetchAdminData();
      logActivity(`Commande de test générée dans la base de données : ${testId}`);
    } catch (e) {
      console.error(e);
    }
  };

  // Save Settings
  const handleSaveSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/settings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ webhookUrl })
      });
      if (res.ok) {
        alert('Paramètres webhook mis à jour dans la base de données !');
        fetchAdminData();
        logActivity('Paramètres webhook de notifications modifiés');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Export Orders to CSV
  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert("Aucune commande à exporter.");
      return;
    }
    const headers = ["ID Commande", "Date", "Nom & Prénom", "Téléphone", "Wilaya", "Adresse", "Offre", "Taille", "Prix (DA)", "Code Promo", "Statut"];
    const rows = orders.map(o => [
      o.id,
      `"${o.date}"`,
      `"${o.fullName}"`,
      `"${o.phone}"`,
      `"${o.wilaya}"`,
      `"${o.address}"`,
      `"${o.offer}"`,
      `"${o.size}"`,
      o.price,
      o.discountApplied ? "LUNEA400 (-400 DA)" : "Non",
      `"${o.status}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(";"), ...rows.map(e => e.join(";"))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Commandes_LUNEA_French_Riviera_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logActivity('Export des commandes au format CSV effectué');
  };

  // Filtered orders for admin search
  const filteredOrders = orders.filter(o => 
    o.fullName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
    o.phone.includes(orderSearchQuery) ||
    o.wilaya.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
    o.id.toLowerCase().includes(orderSearchQuery.toLowerCase())
  );

  // Financial statistics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'Annulée' ? o.price : 0), 0);
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  // Stock timer countdown simulation
  const [stockCount, setStockCount] = useState(15);
  useEffect(() => {
    const timer = setInterval(() => {
      setStockCount((prev) => (prev > 5 ? prev - 1 : prev));
    }, 45000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="app-root">
      {/* 1. TOP ANNOUNCEMENT TICKER */}
      <div className="ticker-bar">
        <div className="ticker-content">
          <span>✦ OFFRE LIMITÉE : PLUS QUE <strong>{stockCount} PIÈCES</strong> EN STOCK ✦</span>
          <span className="ticker-dot"></span>
          <span>LIVRAISON EN MOINS DE 48H DANS TOUTE L'ALGÉRIE (58 WILAYAS)</span>
          <span className="ticker-dot"></span>
          <span>PAIEMENT SÉCURISÉ À LA LIVRAISON</span>
          <span className="ticker-dot"></span>
          <span>ÉCHANGE GRATUIT SOUS 10 JOURS</span>
        </div>
      </div>

      {/* 2. LUXURY NAVBAR */}
      <nav className="navbar">
        <div className="navbar-container">
          <a href="#" className="brand-logo">
            <img src="/images/lunea_full_logo.png" alt="LUNÉA French Riviera Logo" />
          </a>

          <div className="nav-actions">
            <div className="nav-badge-pill">
              <Sparkles size={16} />
              <span>Collection Summer 2026</span>
            </div>

            <button 
              className="btn-gold-sm"
              onClick={() => {
                const el = document.getElementById('offer-selection');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Commander Maintenant
            </button>
          </div>
        </div>
      </nav>

      {/* 3. HERO & PRODUCT SELECTION */}
      <main className="shop-container">
        <div className="product-hero-grid">
          
          {/* GALLERY LEFT */}
          <div className="gallery-wrapper">
            <div className="gallery-main">
              <img 
                src={galleryImages[activeImageIndex].src} 
                alt={galleryImages[activeImageIndex].alt} 
              />
              <div className="gallery-badge">
                ✦ Haute Couture Riviera
              </div>
            </div>

            <div className="gallery-thumbs">
              {galleryImages.map((img, idx) => (
                <button 
                  key={idx}
                  className={`thumb-btn ${activeImageIndex === idx ? 'active' : ''}`}
                  onClick={() => {
                    setActiveImageIndex(idx);
                    logActivity(`Changement d'image produit vers #${idx + 1}`);
                  }}
                >
                  <img src={img.src} alt={img.alt} />
                </button>
              ))}
            </div>
          </div>

          {/* DETAILS & ORDER RIGHT */}
          <div className="product-details">
            <div className="product-breadcrumbs">
              Boutique Officielle / Maillots Robe / Collection Monaco
            </div>

            <h1 className="product-title">
              Maillot robe MONACO.
            </h1>

            <div className="product-rating">
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="#C5A059" stroke="none" />
                ))}
              </div>
              <span className="rating-count">
                <strong>4.9/5</strong> (148 avis clientes vérifiées)
              </span>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.7' }}>
              Le parfait équilibre entre <strong>la grâce d'une robe du soir</strong> et <strong>la fonctionnalité d'un maillot de bain sculptant</strong>. Silhouette effet ventre plat, volants fluides et tissu italien résistant au chlore et au sel.
            </p>

            {/* SELECTION D'OFFRES */}
            <div id="offer-selection">
              <div className="section-label">
                <span>1. Choisissez votre pack :</span>
                <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>
                  ✓ Cadeaux inclus dans les packs stars
                </span>
              </div>

              <div className="offers-stack">
                {OFFERS.map((offer) => {
                  const isSelected = selectedOffer.id === offer.id;
                  return (
                    <div 
                      key={offer.id}
                      className={`offer-card ${isSelected ? 'selected' : ''} ${offer.badge ? 'best-seller' : ''}`}
                      onClick={() => {
                        setSelectedOffer(offer);
                        logActivity(`Sélection de l'offre "${offer.title}"`);
                      }}
                    >
                      {offer.badge && (
                        <div className="badge-best-seller">
                          {offer.badge}
                        </div>
                      )}

                      <div className="offer-radio">
                        {isSelected && <div className="offer-radio-dot" />}
                      </div>

                      <div>
                        <div className="offer-title">{offer.title}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                          {offer.subtitle}
                        </div>
                        <div className="offer-includes">
                          {offer.freebies.map((freebie, fIdx) => (
                            <span key={fIdx} className="offer-tag">
                              {freebie}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="offer-price-box">
                        <div className="price-current">
                          {offer.price.toLocaleString('fr-FR')} DA
                        </div>
                        <div className="price-original">
                          {offer.originalPrice.toLocaleString('fr-FR')} DA
                        </div>
                        <div className="price-savings">
                          Économie {offer.savings.toLocaleString('fr-FR')} DA
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CHOIX DE LA TAILLE */}
            <div>
              <div className="section-label">
                <span>2. Sélectionnez votre taille :</span>
                <button 
                  type="button" 
                  onClick={() => {
                    setIsSizeGuideOpen(true);
                    logActivity('Consultation du guide des tailles');
                  }}
                  style={{ background: 'none', color: 'var(--gold-dark)', textDecoration: 'underline', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  Guide des tailles
                </button>
              </div>

              <div className="size-grid">
                {['34', '36/38', '40/42', '44/46'].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    className={`size-btn ${selectedSize === sz ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedSize(sz);
                      logActivity(`Sélection de la taille ${sz}`);
                    }}
                  >
                    Taille {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* CODE PROMO */}
            <div className="promo-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Percent size={20} color="var(--gold-dark)" />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Code Promo "LUNEA400"</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Offre Dalia (-400 DA de réduction)</div>
                </div>
              </div>

              {!discountApplied ? (
                <form onSubmit={handleApplyPromo} className="promo-input-wrap">
                  <input 
                    type="text" 
                    placeholder="LUNEA400"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    className="promo-input"
                  />
                  <button type="submit" className="btn-promo-apply">Appliquer</button>
                </form>
              ) : (
                <div style={{ color: '#10B981', fontWeight: 700, fontSize: '0.9rem' }}>
                  ✓ -400 DA Appliqués !
                </div>
              )}
            </div>

            {promoError && (
              <div style={{ color: 'var(--accent-red)', fontSize: '0.8rem', marginTop: '-8px' }}>
                {promoError}
              </div>
            )}

            {/* TOTAL RECAP & CTA BUTTON */}
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Total de votre commande :</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', fontWeight: 700, color: 'var(--text-dark)' }}>
                    {finalPrice.toLocaleString('fr-FR')} DA
                  </span>
                  {discountApplied && (
                    <div style={{ fontSize: '0.8rem', color: '#10B981' }}>
                      (Réduction de 400 DA déduite)
                    </div>
                  )}
                </div>
              </div>

              <button 
                type="button"
                className="btn-cta-main"
                onClick={() => {
                  setIsCheckoutOpen(true);
                  logActivity('Ouverture de la modale de commande');
                }}
              >
                <ShoppingBag size={22} />
                CHOISIR MON OFFRE & COMMANDER
              </button>
            </div>

            {/* TRUST BADGES */}
            <div className="trust-badges-grid">
              <div className="trust-item">
                <Truck className="trust-icon" size={24} />
                <div><strong>Livraison 58 Wilayas</strong></div>
                <div>En moins de 48h chez vous</div>
              </div>

              <div className="trust-item">
                <ShieldCheck className="trust-icon" size={24} />
                <div><strong>Paiement à la livraison</strong></div>
                <div>Inspectez avant de payer</div>
              </div>

              <div className="trust-item">
                <RotateCcw className="trust-icon" size={24} />
                <div><strong>Échange Gratuit</strong></div>
                <div>Sous 10 jours garantie</div>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* 4. FEATURES & HIGHLIGHTS */}
      <section className="features-section">
        <div className="section-header">
          <div className="section-subtitle">Haute Couture & Confort Absolu</div>
          <h2 className="section-title">Pourquoi les femmes adorent MONACO</h2>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Sparkles size={28} />
            </div>
            <h3 className="feature-title">Effet Ventre Plat & Galbant</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Une doublure gainante intégrée invisible qui sculpte la taille tout en laissant une totale liberté de mouvement.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Heart size={28} />
            </div>
            <h3 className="feature-title">Volants Riviera Élégants</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Sublimez vos formes avec une jupe à volants superposés qui apporte mouvement, élégance et chic naturel.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Award size={28} />
            </div>
            <h3 className="feature-title">Séchage Ultra-Rapide</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Tissu technique haut de gamme résistant aux UV, au chlore et au sel. Passez de l'eau au cocktail en toute sérénité.
            </p>
          </div>
        </div>
      </section>

      {/* 5. MASONRY PHOTO SHOWCASE */}
      <section className="showcase-section">
        <div className="section-header">
          <div className="section-subtitle">Esprit French Riviera</div>
          <h2 className="section-title">Porté par nos ambassadrices</h2>
        </div>

        <div className="photo-masonry">
          <div className="masonry-item">
            <img src="/images/user_photo_1.jpg" alt="Mannequins LUNÉA sous le parasol" />
          </div>
          <div className="masonry-item">
            <img src="/images/user_photo_2.jpg" alt="Duo mannequins coupe robe maillot" />
          </div>
          <div className="masonry-item">
            <img src="/images/user_photo_3.jpg" alt="Pose parasol resort Riviera" />
          </div>
        </div>
      </section>

      {/* 6. CADEAUX OFFERTS PREVIEW BANNER */}
      <section style={{ background: 'var(--bg-obsidian)', color: '#FFFFFF', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(197, 160, 89, 0.2)', padding: '6px 16px', borderRadius: '100px', color: 'var(--gold-light)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '16px' }}>
            <Gift size={18} />
            <span>INCLUS DANS LE PACK "LA PARFAITE"</span>
          </div>

          <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-serif)', color: '#FFFFFF', marginBottom: '16px' }}>
            Sac de Plage + Lunettes de Soleil Offerts
          </h2>

          <p style={{ color: '#D4CEB8', fontSize: '1rem', maxWidth: '640px', margin: '0 auto 32px auto' }}>
            Pour toute commande du pack <strong>La Parfaite</strong> ou <strong>Le Double Parfait</strong>, recevez gratuitement notre sac cabas Riviera ainsi que notre paire de lunettes de soleil tendance.
          </p>

          <button 
            type="button"
            className="btn-gold-sm"
            onClick={() => {
              setSelectedOffer(OFFERS[1]);
              setIsCheckoutOpen(true);
            }}
            style={{ fontSize: '1rem', padding: '14px 32px' }}
          >
            Réclamer Mon Pack avec Cadeaux
          </button>
        </div>
      </section>

      {/* 7. CUSTOMER REVIEWS */}
      <section style={{ padding: '80px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <div className="section-header">
          <div className="section-subtitle">Témoignages Vérifiés</div>
          <h2 className="section-title">Ce que disent nos clientes en Algérie</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {[
            {
              name: "Yasmine K. (Alger)",
              rating: 5,
              text: "Qualité exceptionnelle ! Le tissu est gainant sans serrer, les volants tombent à merveille. Reçu en 24h à Alger avec le sac offert.",
              date: "Il y a 2 jours"
            },
            {
              name: "Amel B. (Oran)",
              rating: 5,
              text: "Franchement waouh ! Enfin un maillot robe très chic et pudique. Ma taille 38 me va parfaitement. Merci LUNÉA !",
              date: "Il y a 5 jours"
            },
            {
              name: "Lyna M. (Sétif)",
              rating: 5,
              text: "J'ai pris le pack La Parfaite, le sac et les lunettes sont superbes. Livraison rapide à Sétif et paiement après vérification.",
              date: "Il y a 1 semaine"
            }
          ].map((rev, rIdx) => (
            <div key={rIdx} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '24px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lux)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{rev.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rev.date}</div>
              </div>
              <div className="stars" style={{ marginBottom: '12px' }}>
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="#C5A059" stroke="none" />
                ))}
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                "{rev.text}"
              </p>
              <div style={{ marginTop: '16px', fontSize: '0.75rem', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} /> Achat Vérifié LUNÉA
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer style={{ background: 'var(--bg-obsidian)', color: '#8E8880', padding: '48px 24px 80px 24px', borderTop: '1px solid rgba(197, 160, 89, 0.2)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
          <img src="/images/lunea_full_logo.png" alt="LUNÉA French Riviera Logo" style={{ height: '56px', objectFit: 'contain' }} />
          <p style={{ fontSize: '0.85rem', maxWidth: '500px' }}>
            LUNÉA French Riviera — Marque déposée de prêt-à-porter balnéaire de luxe. Tous droits réservés 2026.
          </p>
          <div style={{ fontSize: '0.8rem', display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span>Livraison 58 Wilayas</span>
            <span>•</span>
            <span>Paiement à la livraison</span>
            <span>•</span>
            <span>Échange sous 10 jours</span>
          </div>
        </div>
      </footer>

      {/* 9. STICKY MOBILE CTA BAR */}
      <div className="sticky-mobile-bar">
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pack {selectedOffer.title}</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'var(--font-serif)' }}>
            {finalPrice.toLocaleString('fr-FR')} DA
          </div>
        </div>
        <button 
          className="btn-gold-sm"
          onClick={() => setIsCheckoutOpen(true)}
          style={{ flexGrow: 1, maxWidth: '200px', textAlign: 'center' }}
        >
          Commander
        </button>
      </div>

      {/* 10. CHECKOUT MODAL (58 WILAYAS COD) */}
      {isCheckoutOpen && (
        <div className="modal-overlay" onClick={() => setIsCheckoutOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsCheckoutOpen(false)}>
              <X size={20} />
            </button>

            {!isOrderSubmitted ? (
              <>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--gold-dark)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Commande Express (Paiement à la Livraison)
                  </div>
                  <h3 style={{ fontSize: '1.8rem', marginTop: '4px' }}>
                    Finalisez votre commande
                  </h3>
                </div>

                {/* SUMMARY RECAP */}
                <div style={{ background: 'var(--bg-sand)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                    <span>Pack sélectionné :</span>
                    <strong>{selectedOffer.title} ({selectedSize})</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                    <span>Livraison :</span>
                    <strong style={{ color: '#10B981' }}>GRATUITE (58 Wilayas)</strong>
                  </div>
                  {discountApplied && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#10B981' }}>
                      <span>Code promo LUNEA400 :</span>
                      <strong>-400 DA</strong>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)', fontSize: '1.1rem', fontWeight: 700 }}>
                    <span>Montant Total à payer à la livraison :</span>
                    <span style={{ color: 'var(--gold-dark)' }}>{finalPrice.toLocaleString('fr-FR')} DA</span>
                  </div>
                </div>

                <form onSubmit={handleSubmitOrder}>
                  <div className="form-group">
                    <label className="form-label">Nom et Prénom *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Yasmine Benali"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Numéro de Téléphone *</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="Ex: 0550 12 34 56"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Wilaya de Livraison *</label>
                    <select 
                      value={formData.wilaya}
                      onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                      className="form-select"
                    >
                      {ALGERIA_WILAYAS.map((w) => (
                        <option key={w.code} value={`${w.code} - ${w.name}`}>
                          {w.code} - {w.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Commune & Adresse de livraison *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Hydra, Rue des Pins N° 12"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <button type="submit" className="btn-cta-main" style={{ marginTop: '16px' }}>
                    CONFIRMER MA COMMANDE ({finalPrice.toLocaleString('fr-FR')} DA)
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    🔒 Vos données sont sécurisées. Vous ne payez qu'à la réception du colis.
                  </div>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                  <Check size={36} />
                </div>
                <h3 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', marginBottom: '12px' }}>
                  Commande Confirmée !
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '24px' }}>
                  Merci <strong>{formData.fullName}</strong> ! Votre commande du pack <strong>{selectedOffer.title} (Taille {selectedSize})</strong> a été enregistrée avec succès. Notre service client vous contactera au <strong>{formData.phone}</strong> sous peu pour confirmer la livraison.
                </p>
                <div style={{ background: 'var(--bg-sand)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px', fontSize: '0.9rem' }}>
                  <div>Wilaya de destination : <strong>{formData.wilaya}</strong></div>
                  <div>Montant total COD : <strong>{finalPrice.toLocaleString('fr-FR')} DA</strong></div>
                </div>
                <button 
                  className="btn-gold-sm" 
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setIsOrderSubmitted(false);
                  }}
                  style={{ padding: '12px 28px' }}
                >
                  Retour à la boutique
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 11. SIZE GUIDE MODAL */}
      {isSizeGuideOpen && (
        <div className="modal-overlay" onClick={() => setIsSizeGuideOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsSizeGuideOpen(false)}>
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '16px', fontFamily: 'var(--font-serif)' }}>
              Guide des Tailles — Maillot Robe MONACO
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Le Maillot Robe MONACO est conçu avec une matière extensible galbante. Si vous êtes entre deux tailles, nous vous recommandons de choisir la taille au-dessus.
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-sand-dark)', borderBottom: '2px solid var(--border-subtle)' }}>
                  <th style={{ padding: '10px' }}>Taille</th>
                  <th style={{ padding: '10px' }}>Tour de Poitrine</th>
                  <th style={{ padding: '10px' }}>Tour de Taille</th>
                  <th style={{ padding: '10px' }}>Tour de Hanches</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px', fontWeight: 700 }}>34</td>
                  <td style={{ padding: '10px' }}>80 - 84 cm</td>
                  <td style={{ padding: '10px' }}>60 - 64 cm</td>
                  <td style={{ padding: '10px' }}>86 - 90 cm</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px', fontWeight: 700 }}>36 / 38</td>
                  <td style={{ padding: '10px' }}>85 - 92 cm</td>
                  <td style={{ padding: '10px' }}>65 - 72 cm</td>
                  <td style={{ padding: '10px' }}>91 - 98 cm</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px', fontWeight: 700 }}>40 / 42</td>
                  <td style={{ padding: '10px' }}>93 - 100 cm</td>
                  <td style={{ padding: '10px' }}>73 - 80 cm</td>
                  <td style={{ padding: '10px' }}>99 - 106 cm</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px', fontWeight: 700 }}>44 / 46</td>
                  <td style={{ padding: '10px' }}>101 - 110 cm</td>
                  <td style={{ padding: '10px' }}>81 - 90 cm</td>
                  <td style={{ padding: '10px' }}>107 - 116 cm</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 12. SECURE REST API ADMIN DASHBOARD & ORDER COLLECTOR MODAL */}
      {/* ======================================================== */}
      {isAdminOpen && (
        <div className="modal-overlay" onClick={() => setIsAdminOpen(false)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '1000px', width: '95%', padding: '0', overflow: 'hidden', background: '#FFFFFF' }}
          >
            {/* ADMIN HEADER */}
            <div style={{ background: 'var(--bg-obsidian)', color: '#FFFFFF', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid var(--gold-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <LayoutDashboard size={24} color="var(--gold-light)" />
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-serif)', color: '#FFFFFF' }}>
                    Espace Administration LUNÉA
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#D4CEB8' }}>
                    Base de données sécurisée & Journal d'activité (non visible des clients)
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isAdminAuthenticated && (
                  <>
                    <button 
                      onClick={handleAddTestOrder}
                      style={{ background: 'rgba(197, 160, 89, 0.2)', border: '1px solid var(--gold-primary)', color: 'var(--gold-light)', padding: '6px 14px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      + Générer Commande Test
                    </button>
                    <button 
                      onClick={handleLogout}
                      style={{ background: '#EF4444', color: '#FFFFFF', padding: '6px 14px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Déconnexion
                    </button>
                  </>
                )}
                <button 
                  onClick={() => setIsAdminOpen(false)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFFFFF', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* ADMIN AUTH CHECK OR DASHBOARD */}
            {!isAdminAuthenticated ? (
              <div style={{ padding: '40px 24px', textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
                <Lock size={40} color="var(--gold-dark)" style={{ marginBottom: '12px' }} />
                <h4 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Accès Sécurisé Admin</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  Entrez le code d'accès de votre base de données (par défaut : <strong>admin123</strong>)
                </p>

                <form onSubmit={handleAdminLogin}>
                  <input 
                    type="password" 
                    placeholder="Code d'accès..."
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    className="form-input"
                    style={{ marginBottom: '16px', textAlign: 'center' }}
                  />
                  <button type="submit" className="btn-gold-sm" style={{ width: '100%' }}>
                    Déverrouiller la Base de Données
                  </button>
                </form>
              </div>
            ) : (
              <div style={{ padding: '24px' }}>
                {/* KPI CARDS SUMMARY */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ background: 'var(--bg-sand)', border: '1px solid var(--border-subtle)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <TrendingUp size={16} color="#10B981" /> Chiffre d'Affaires Réel
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--text-dark)', marginTop: '4px' }}>
                      {totalRevenue.toLocaleString('fr-FR')} DA
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-sand)', border: '1px solid var(--border-subtle)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ListOrdered size={16} color="var(--gold-dark)" /> Commandes Enregistrées
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--text-dark)', marginTop: '4px' }}>
                      {orders.length}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-sand)', border: '1px solid var(--border-subtle)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <BarChart3 size={16} color="#3B82F6" /> Panier Moyen
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--text-dark)', marginTop: '4px' }}>
                      {avgOrderValue.toLocaleString('fr-FR')} DA
                    </div>
                  </div>
                </div>

                {/* TAB NAVIGATION */}
                <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
                  {[
                    { id: 'orders', label: `Base de Données Commandes (${orders.length})`, icon: ShoppingBag },
                    { id: 'activities', label: 'Journal d\'Activité Serveur', icon: Clock },
                    { id: 'settings', label: 'Webhooks & Notifications', icon: BellRing }
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = adminTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setAdminTab(tab.id)}
                        style={{
                          padding: '10px 18px',
                          border: 'none',
                          background: 'none',
                          borderBottom: isActive ? '3px solid var(--gold-primary)' : '3px solid transparent',
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? 'var(--gold-dark)' : 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.9rem'
                        }}
                      >
                        <Icon size={16} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* TAB CONTENT: ORDERS */}
                {adminTab === 'orders' && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1, maxWidth: '400px', background: 'var(--bg-sand)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                        <Search size={18} color="var(--text-muted)" />
                        <input 
                          type="text"
                          placeholder="Rechercher par nom, tél, Wilaya ou ID..."
                          value={orderSearchQuery}
                          onChange={(e) => setOrderSearchQuery(e.target.value)}
                          style={{ border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '0.85rem' }}
                        />
                      </div>

                      <button 
                        onClick={handleExportCSV}
                        className="btn-gold-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}
                      >
                        <Download size={16} /> Exporter Excel / CSV
                      </button>
                    </div>

                    {filteredOrders.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Aucune commande trouvée dans la base de données.
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ background: 'var(--bg-sand-dark)', borderBottom: '2px solid var(--border-subtle)' }}>
                              <th style={{ padding: '12px' }}>ID & Date</th>
                              <th style={{ padding: '12px' }}>Cliente</th>
                              <th style={{ padding: '12px' }}>Téléphone</th>
                              <th style={{ padding: '12px' }}>Wilaya & Adresse</th>
                              <th style={{ padding: '12px' }}>Offre & Taille</th>
                              <th style={{ padding: '12px' }}>Total (DA)</th>
                              <th style={{ padding: '12px' }}>Statut</th>
                              <th style={{ padding: '12px' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredOrders.map(order => (
                              <tr key={order.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <td style={{ padding: '12px' }}>
                                  <div style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{order.id}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.date}</div>
                                </td>
                                <td style={{ padding: '12px', fontWeight: 600 }}>{order.fullName}</td>
                                <td style={{ padding: '12px' }}>
                                  <a href={`tel:${order.phone}`} style={{ color: 'var(--gold-dark)', textDecoration: 'none', fontWeight: 600 }}>
                                    {order.phone}
                                  </a>
                                </td>
                                <td style={{ padding: '12px' }}>
                                  <div style={{ fontWeight: 600 }}>{order.wilaya}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.address}</div>
                                </td>
                                <td style={{ padding: '12px' }}>
                                  <span style={{ background: 'rgba(197, 160, 89, 0.15)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem' }}>
                                    {order.offer}
                                  </span>
                                  <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>Taille: <strong>{order.size}</strong></div>
                                </td>
                                <td style={{ padding: '12px', fontWeight: 700, fontFamily: 'var(--font-serif)', fontSize: '1rem' }}>
                                  {order.price.toLocaleString('fr-FR')} DA
                                </td>
                                <td style={{ padding: '12px' }}>
                                  <select 
                                    value={order.status}
                                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                    style={{
                                      padding: '4px 8px',
                                      borderRadius: '100px',
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      border: 'none',
                                      cursor: 'pointer',
                                      background: order.status === 'En attente' ? '#FEF3C7' :
                                                  order.status === 'Confirmée' ? '#DBEAFE' :
                                                  order.status === 'Expédiée' ? '#E0E7FF' :
                                                  order.status === 'Livrée' ? '#D1FAE5' : '#FEE2E2',
                                      color: order.status === 'En attente' ? '#92400E' :
                                             order.status === 'Confirmée' ? '#1E40AF' :
                                             order.status === 'Expédiée' ? '#3730A3' :
                                             order.status === 'Livrée' ? '#065F46' : '#991B1B'
                                    }}
                                  >
                                    <option value="En attente">⏳ En attente</option>
                                    <option value="Confirmée">📞 Confirmée</option>
                                    <option value="Expédiée">🚚 Expédiée</option>
                                    <option value="Livrée">✅ Livrée</option>
                                    <option value="Annulée">❌ Annulée</option>
                                  </select>
                                </td>
                                <td style={{ padding: '12px' }}>
                                  <button 
                                    onClick={() => handleDeleteOrder(order.id)}
                                    style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                                    title="Supprimer la commande de la base de données"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB CONTENT: ACTIVITIES */}
                {adminTab === 'activities' && (
                  <div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '12px' }}>Dernières actions sur le site (Sauvegardées sur le serveur)</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
                      {activities.map(act => (
                        <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-sand)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                          <span>{act.text}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{act.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: SETTINGS & WEBHOOKS */}
                {adminTab === 'settings' && (
                  <div style={{ maxWidth: '600px' }}>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Notification Automatique des Commandes (Webhook)</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                      Entrez l'URL d'un webhook (Discord Webhook, Telegram Bot ou Make/Zapier). Chaque fois qu'une nouvelle cliente passe commande sur le site, une notification instantanée vous sera envoyée !
                    </p>

                    <div className="form-group">
                      <label className="form-label">URL Webhook (Discord / Telegram / Make) :</label>
                      <input 
                        type="url"
                        placeholder="https://discord.com/api/webhooks/..."
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <button 
                      onClick={handleSaveSettings} 
                      className="btn-gold-sm"
                      style={{ marginTop: '10px' }}
                    >
                      Enregistrer les Paramètres
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
