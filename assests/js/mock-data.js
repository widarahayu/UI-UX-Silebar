/**
 * SILEBAR Mock Data & Logic Service
 * Handles all localStorage operations to simulate a backend.
 */

const DB_KEYS = {
    USERS: 'silebar_users',
    AUCTIONS: 'silebar_auctions',
    SESSION: 'silebar_session',
    BIDS: 'silebar_bids'
};

// Initial Data Seeding
function seedData() {
    if (!localStorage.getItem(DB_KEYS.AUCTIONS)) {
        const dummyAuctions = [
            {
                id: 'auc_001',
                title: 'PlayStation 5 Digital Edition',
                category: 'Elektronik',
                price: 5500000,
                description: 'Kondisi bekas mulus, pemakaian 3 bulan. Fullset.',
                status: 'active', // active, pending, rejected, sold
                seller_email: 'seller@silebar.com',
                image: 'https://placehold.co/400x300/e2e8f0/64748b?text=PS5',
                created_at: new Date().toISOString(),
                end_time: new Date(Date.now() + 86400000).toISOString() // +1 day
            },
            {
                id: 'auc_002',
                title: 'iPhone 13 128GB Midnight',
                category: 'Elektronik',
                price: 8000000,
                description: 'Ex iBox, battery health 90%.',
                status: 'pending', 
                seller_email: 'seller@silebar.com',
                image: 'https://placehold.co/400x300/e2e8f0/64748b?text=iPhone',
                created_at: new Date().toISOString(),
                end_time: new Date(Date.now() + 172800000).toISOString() // +2 days
            }
        ];
        localStorage.setItem(DB_KEYS.AUCTIONS, JSON.stringify(dummyAuctions));
    }
}

// Data Access Object (DAO)
const MockDB = {
    // Session Management
    login: (email, role) => {
        const session = { email, role, loggedInAt: new Date() };
        localStorage.setItem(DB_KEYS.SESSION, JSON.stringify(session));
        return session;
    },
    
    logout: () => {
        localStorage.removeItem(DB_KEYS.SESSION);
        window.location.href = 'login.html';
    },

    getSession: () => {
        const sessionStr = localStorage.getItem(DB_KEYS.SESSION);
        return sessionStr ? JSON.parse(sessionStr) : null;
    },

    requireAuth: (allowedRoles = []) => {
        const session = MockDB.getSession();
        if (!session) {
            window.location.href = 'login.html';
            return;
        }
        if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
            alert('Akses ditolak. Anda tidak memiliki izin.');
            window.location.href = 'index.html'; // Fallback
        }
        return session;
    },

    // User Helpers
    getCurrentUserEmail: () => {
        const session = MockDB.getSession();
        return session ? session.email : null;
    },

    // Auction Management
    getAuctions: (filter = {}) => {
        let auctions = JSON.parse(localStorage.getItem(DB_KEYS.AUCTIONS) || '[]');
        
        if (filter.status) {
            auctions = auctions.filter(a => a.status === filter.status);
        }
        if (filter.seller_email) {
            auctions = auctions.filter(a => a.seller_email === filter.seller_email);
        }
        
        return auctions;
    },

    getAuctionById: (id) => {
        const auctions = MockDB.getAuctions();
        return auctions.find(a => a.id === id);
    },

    createAuction: (data) => {
        const auctions = MockDB.getAuctions();
        const newAuction = {
            id: 'auc_' + Date.now(),
            status: 'pending', // Default status for new items
            created_at: new Date().toISOString(),
            ...data
        };
        auctions.unshift(newAuction); // Add to top
        localStorage.setItem(DB_KEYS.AUCTIONS, JSON.stringify(auctions));
        return newAuction;
    },

    updateAuctionStatus: (id, status) => {
        const auctions = MockDB.getAuctions();
        const index = auctions.findIndex(a => a.id === id);
        if (index !== -1) {
            auctions[index].status = status;
            localStorage.setItem(DB_KEYS.AUCTIONS, JSON.stringify(auctions));
            return true;
        }
        return false;
    },

    // Formatters
    formatCurrency: (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    }
};

// Initialize on load
seedData();
