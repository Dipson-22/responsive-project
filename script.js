// ==========================================
// PART 2: APP STATE
// ==========================================
let appState = {
    isLoggedIn: false,
    role: null, // 'customer' or 'provider'
    activeBooking: null, 
    selectedProvider: null, 
    selectedPayment: null,
    currentUser: { name: 'Aarav' },
    notifications: [],
    bookingsHistory: [
        {
            service: 'Plumbing Repair',
            provider: 'Krishna Plumbing Solutions',
            date: 'Oct 12, 2023 • 10:30 AM',
            price: 'NPR 1,200',
            status: 'Completed'
        },
        {
            service: 'Home Shifting',
            provider: 'Quick Movers Butwal',
            date: 'Sep 28, 2023 • 09:00 AM',
            price: 'NPR 8,500',
            status: 'Cancelled'
        }
    ]
};




// ==========================================
// PART 3: PROVIDER DATA
// ==========================================
const categories = ['Electrician', 'Plumber', 'Mechanic', 'Cleaner', 'Carpenter', 'Painter', 'Home Shifting', 'Appliance Repair'];
const firstNames = ['Bikash', 'Sunita', 'Rajan', 'Anil', 'Puja', 'Hari', 'Sita', 'Ramesh', 'Gita', 'Nabin', 'Binita', 'Santosh'];
const lastNames = ['Thapa', 'Karki', 'Gurung', 'Shrestha', 'Magar', 'Tamang', 'Rai', 'Pokhrel', 'Sharma', 'Khadka', 'Dahal', 'Chaudhari'];

const providers = [];
let idCounter = 1;

categories.forEach(category => {
    for (let i = 0; i < 3; i++) {
        const randomFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
        const randomLast = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        providers.push({
            id: `p${idCounter}`,
            name: `${randomFirst} ${randomLast}`,
            category: category,
            pricePerHour: Math.floor(Math.random() * 1000) + 500, // Rs 500 - 1500
            rating: (Math.random() * 1 + 4).toFixed(1), // 4.0 to 5.0
            reviewCount: Math.floor(Math.random() * 150) + 10,
            online: i < 2, // First 2 are online, 3rd is offline
            distance: (Math.random() * 5 + 0.5).toFixed(1),
            avatarUrl: `https://picsum.photos/100?random=${idCounter}`
        });
        idCounter++;
    }
});

// ==========================================
// PART 0 & 1: SPA ROUTER & HEADER LOGIC
// ==========================================
const routes = {
    home: 'index.html',
    services: 'services.html',
    howItWorks: 'how-it-works.html',
    becomeProvider: 'become-provider.html',
    login: 'login.html',
    dashboard: 'dashboard.html',
    findProvider: 'find-a-provider.html',
    providerProfile: 'provider-profile.html',
    bookingService: 'booking-service.html',
    payment: 'simulated-payment.html',
    bookingConfirmed: 'booking-confirmed.html',
    liveTrackingCustomer: 'live-tracking-customer.html',
    liveTrackingProvider: 'live-tracking-provider.html',
    ratingReview: 'rating-review.html',
    bookingReceipt: 'booking-receipt.html',
    providerDashboard: 'provider-dashboard.html'
};

async function navigateTo(routeName, params = {}) {
    try {
        if (routeName === 'home' && appState.isLoggedIn) {
            routeName = appState.role === 'customer' ? 'dashboard' : 'providerProfile';
        }

        const response = await fetch(routes[routeName] + '?t=' + new Date().getTime(), { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        let html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const newPageBody = doc.querySelector('#page-body');
        const newFooter = doc.querySelector('.footer');
        const appContent = document.getElementById('app-content');

        appContent.innerHTML = '';
        
        if (newPageBody) appContent.appendChild(newPageBody);
        if (newFooter) appContent.appendChild(newFooter);

        updateHeader(routeName);
        window.scrollTo(0, 0);
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        initPageLogic(routeName, params);

    } catch (error) {
        console.error("Navigation Error:", error);
    }
}


function updateCustomerHeaderUI() {
    const rawName = (appState.currentUser && appState.currentUser.name) ? appState.currentUser.name.trim() : 'Aarav';
    const firstLetter = rawName.charAt(0).toUpperCase() || 'A';
    const emailPrefix = rawName.toLowerCase().replace(/\s+/g, '');

    const avatarEl = document.getElementById('customer-header-avatar');
    const dropNameEl = document.getElementById('dropdown-user-name');
    const dropEmailEl = document.getElementById('dropdown-user-email');

    if (avatarEl) avatarEl.textContent = firstLetter;
    if (dropNameEl) dropNameEl.textContent = rawName;
    if (dropEmailEl) dropEmailEl.textContent = `${emailPrefix}@gmail.com`;
}


window.handleTrackServiceClick = function() {
    if (appState.activeBooking) {
        navigateTo('liveTrackingCustomer');
    } else {
        showPopup('Book a provider to track your service', 'info');
        navigateTo('findProvider');
    }
};



function updateHeader(routeName) {
    const wrapper = document.getElementById('header-wrapper');
    const headerPublic = document.getElementById('header-public');
    const headerCustomer = document.getElementById('header-customer');
    const headerProvider = document.getElementById('header-provider');
    const headerProviderMinimal = document.getElementById('header-provider-minimal');
    const appContent = document.getElementById('app-content');

    if (routeName === 'bookingService' || routeName === 'payment' || routeName === 'bookingConfirmed' || routeName === 'bookingReceipt' || routeName === 'ratingReview') {
        if (wrapper) wrapper.style.display = 'none';
        if (appContent) appContent.style.paddingTop = '0px';
        return;
    }

    document.body.className = ''; 
    if (routeName === 'dashboard') document.body.classList.add('dashboard-body');
    if (routeName === 'findProvider') document.body.classList.add('fap-body');
    if (routeName === 'services') document.body.classList.add('services-body');
    
    if (wrapper) wrapper.style.display = 'block';

    if (headerPublic) headerPublic.classList.add('hidden');
    if (headerCustomer) headerCustomer.classList.add('hidden');
    if (headerProvider) headerProvider.classList.add('hidden');
    if (headerProviderMinimal) headerProviderMinimal.classList.add('hidden');

    if (routeName === 'login') {
        if (wrapper) wrapper.style.display = 'none';
        if (appContent) {
            appContent.style.display = 'block';
            appContent.style.height = 'auto';
            appContent.style.paddingTop = '0px'; 
            appContent.style.overflowY = 'auto';
        }
        return; 
    } else {
        if (appContent) {
            appContent.style.display = '';
            appContent.style.height = '';
            appContent.style.paddingTop = ''; 
            appContent.style.overflowY = '';
        }
    }

    if (routeName === 'providerDashboard') {
        if (headerProvider) headerProvider.classList.remove('hidden');
    } else if (!appState.isLoggedIn) {
        if (headerPublic) headerPublic.classList.remove('hidden');
    } else if (appState.isLoggedIn && appState.role === 'customer') {
        if (headerCustomer) headerCustomer.classList.remove('hidden');
        updateCustomerHeaderUI();
    } else if (appState.isLoggedIn && appState.role === 'provider') {
        if (headerProvider) headerProvider.classList.remove('hidden');
    }

    const allNavLinks = document.querySelectorAll('nav a, .nav-links a, .public-nav-links a');
    allNavLinks.forEach(link => {
        if (link.classList.contains('logo') || link.classList.contains('brand-logo-group') || link.classList.contains('btn')) {
            return;
        }
        link.classList.remove('active');
        const onclickAttr = link.getAttribute('onclick') || '';

        // Match exact route or track service handler
        if (onclickAttr.includes(`navigateTo('${routeName}')`)) {
            link.classList.add('active');
        } else if (routeName === 'liveTrackingCustomer' && onclickAttr.includes('handleTrackServiceClick')) {
            link.classList.add('active');
        }
    });
}

// ==========================================
// PART 6: POPUP SYSTEM
// ==========================================
function showPopup(message, type = 'error') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const popup = document.createElement('div');
    const colorClass = (type === 'error') ? 'toast-red' : 'toast-green';
    popup.className = `toast-box ${colorClass}`;
    
    popup.innerHTML = `<span>${message}</span>`;
    container.appendChild(popup);
    
    setTimeout(() => { if (popup.parentElement) popup.remove(); }, 3000);
}

// ==========================================
// PART 4: PAGE INIT LOGIC
// ==========================================
function initPageLogic(routeName, params) {
    if (routeName === 'home') initHome();
    if (routeName === 'login') initLogin(params);
    if (routeName === 'dashboard') initDashboard(params);
    if (routeName === 'services') initServices(params);
    if (routeName === 'findProvider') initFindProvider(params); 
    if (routeName === 'bookingService') initBookingService(params);
    if (routeName === 'payment') initPayment();
    if (routeName === 'bookingConfirmed') initBookingConfirmed();
    if (routeName === 'bookingReceipt') initBookingReceipt();
    if (routeName === 'liveTrackingCustomer') initLiveTrackingCustomer();
    if (routeName === 'ratingReview') initRatingReview(params);
    if (routeName === 'howItWorks') initHowItWorks();
    if (routeName === 'becomeProvider'){}
    if (routeName === 'providerProfile') initProviderProfile();
    if (routeName === 'providerDashboard') initProviderDashboard();
}





// --- Home Logic ---
// --- Home Logic ---
function initHome() {
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.getElementById('home-search-input');
    
    if (searchInput) {
        // Support pressing Enter key in search box
        searchInput.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                executeSearch(searchInput.value);
            }
        };
    }

    if (searchBtn && searchInput) {
        searchBtn.onclick = (e) => {
            e.preventDefault();
            executeSearch(searchInput.value);
        };
    }
}

window.executeSearch = function(query) {
    if (!query) {
        navigateTo('services');
        return;
    }
    const q = query.trim().toLowerCase();

    // Match keywords & synonyms directly to categories
    const match = categories.find(cat => {
        const c = cat.toLowerCase();
        if (c.includes(q) || q.includes(c)) return true;
        if (q.includes('clean') && c === 'cleaner') return true;
        if (q.includes('carpent') && c === 'carpenter') return true;
        if ((q.includes('ac') || q.includes('repair')) && c === 'appliance repair') return true;
        if ((q.includes('shift') || q.includes('move')) && c === 'home shifting') return true;
        return false;
    });

    if (match) {
        navigateTo('services', { openCategory: match });
    } else {
        navigateTo('services');
    }
};
// --- Login Logic ---
function initLogin(params) {
    const loginRoleCards = document.querySelectorAll('.login-layout .role-card');
    let currentLoginRole = 'customer'; 

    if (params && params.defaultRole === 'provider') {
        const providerCard = document.querySelectorAll('.login-layout .role-card')[1];
        if (providerCard) providerCard.click();
    }

    if (loginRoleCards.length > 0) {
        loginRoleCards.forEach((card, index) => {
            card.onclick = () => {
                loginRoleCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                currentLoginRole = index === 0 ? 'customer' : 'provider';
            };
        });
    }

    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            const usernameInput = document.getElementById('username').value.trim();
            const passwordInput = document.getElementById('password').value;

            // Accepts any username with password 'admin'
            if (usernameInput && passwordInput === 'admin') {
                appState.isLoggedIn = true;
                appState.role = currentLoginRole;
                appState.currentUser = { name: usernameInput };
                showPopup("Logged in successfully", "success");
                
                if (currentLoginRole === 'customer') {
                    navigateTo('dashboard');
                } else {
                    navigateTo('providerProfile');
                }
            } else {
                showPopup("Invalid credentials. Enter any username and password 'admin'", "error");
            }
        };
    }

    if (params && params.openSignup) {
        const globalModal = document.getElementById('global-signup-modal');
        if (globalModal) {
            globalModal.style.display = 'flex';
        }
    }
}

// --- Updated togglePasswordVisibility ---
window.togglePasswordVisibility = function() {
    const passwordInput = document.getElementById('password') || document.getElementById('login-password');
    const eyeBtn = document.getElementById('toggle-password-btn');
    if (!passwordInput || !eyeBtn) return;

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m2 2 20 20"/>
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
            </svg>
        `;
    } else {
        passwordInput.type = 'password';
        eyeBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>
        `;
    }
};

// --- Updated login form handler inside initLogin() ---
function initLogin(params) {
    const loginRoleCards = document.querySelectorAll('.login-layout .role-card');
    let currentLoginRole = 'customer'; 

    if (params && params.defaultRole === 'provider') {
        const providerCard = document.querySelectorAll('.login-layout .role-card')[1];
        if (providerCard) providerCard.click();
    }

    if (loginRoleCards.length > 0) {
        loginRoleCards.forEach((card, index) => {
            card.onclick = () => {
                loginRoleCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                currentLoginRole = index === 0 ? 'customer' : 'provider';
            };
        });
    }

    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            const usernameEl = document.getElementById('username') || document.getElementById('login-username');
            const passwordEl = document.getElementById('password') || document.getElementById('login-password');

            const usernameInput = usernameEl ? usernameEl.value.trim() : '';
            const passwordInput = passwordEl ? passwordEl.value : '';

            // Accepts any username with password 'admin'
            if (usernameInput && passwordInput === 'admin') {
                appState.isLoggedIn = true;
                appState.role = currentLoginRole;
                appState.currentUser = { name: usernameInput };
                showPopup("Logged in successfully", "success");
                
                if (currentLoginRole === 'customer') {
                    navigateTo('dashboard');
                } else {
                    navigateTo('providerProfile');
                }
            } else {
                showPopup("Invalid credentials. Enter any username and password 'admin'", "error");
            }
        };
    }

    if (params && params.openSignup) {
        const globalModal = document.getElementById('global-signup-modal');
        if (globalModal) {
            globalModal.style.display = 'flex';
        }
    }
}




// Start the app on load
// Start the app on load + initialize notification system
document.addEventListener('DOMContentLoaded', () => {
    // 1. Seed notifications from bookingsHistory (avoiding duplicates)
    appState.bookingsHistory.forEach(item => {
        if (item.status === 'Completed') {
            const notifId = 'rate-' + item.service;
            if (!appState.notifications.some(n => n.id === notifId)) {
                appState.notifications.push({
                    id: notifId,
                    type: 'rate',
                    title: `Rate your service for ${item.service}`,
                    time: item.date,
                    read: false,
                    route: 'ratingReview',
                    routeParams: { serviceName: item.service }
                });
            }
        } else if (item.status === 'Cancelled') {
            const notifId = 'cancel-' + item.service;
            if (!appState.notifications.some(n => n.id === notifId)) {
                appState.notifications.push({
                    id: notifId,
                    type: 'cancelled',
                    title: `Your ${item.service} booking was cancelled`,
                    time: item.date,
                    read: false,
                    route: null
                });
            }
        }
    });
    updateNotificationBadge();

    // 2. Bell button toggle click listener
    const bellBtn = document.getElementById('notification-bell-btn');
    if (bellBtn) {
        bellBtn.onclick = (e) => {
            e.stopPropagation();
            const dropdown = document.getElementById('notification-dropdown');
            if (dropdown) {
                renderNotifications();
                dropdown.classList.toggle('hidden');
            }
            // Close profile dropdown if it is currently open
            const profileDrop = document.getElementById('customer-profile-dropdown');
            if (profileDrop) profileDrop.style.display = 'none';
        };
    }

    // 3. Launch App
    updateHeader('home');
    initPageLogic('home');
});

// ==========================================
// GLOBAL SIGNUP MODAL LOGIC
// ==========================================
// ==========================================
// GLOBAL SIGNUP MODAL LOGIC
// ==========================================
// ==========================================
// GLOBAL SIGNUP MODAL LOGIC
// ==========================================
window.signupRole = 'customer';

window.selectSignupRole = function(role) {
    window.signupRole = role;
    const custCard = document.getElementById('modal-role-cust');
    const provCard = document.getElementById('modal-role-prov');
    if (!custCard || !provCard) return;

    if (role === 'customer') {
        custCard.style.border = '2px solid #004AC6';
        custCard.style.backgroundColor = 'rgba(219, 225, 255, 0.3)';
        provCard.style.border = '1px solid #C3C6D7';
        provCard.style.backgroundColor = '#FFFFFF';
    } else {
        provCard.style.border = '2px solid #004AC6';
        provCard.style.backgroundColor = 'rgba(219, 225, 255, 0.3)';
        custCard.style.border = '1px solid #C3C6D7';
        custCard.style.backgroundColor = '#FFFFFF';
    }
};

window.closeSignupModal = function() {
    const modal = document.getElementById('global-signup-modal');
    if (modal) modal.style.display = 'none';
};

window.handleGlobalSignup = function(e) {
    if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
    }

    const modal = document.getElementById('global-signup-modal');
    const form = document.getElementById('global-signup-form');
    if (!modal || !form) return;

    // Trigger browser HTML5 popups if form isn't valid
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const nameInput = document.getElementById('signup-name');
    const fullName = nameInput ? nameInput.value.trim() : '';

    // 1. Close modal & reset fields
    modal.style.display = 'none';
    form.reset();
    window.selectSignupRole('customer');

    // 2. Show alert
    showPopup("Account created successfully! Please log in.", "success");

    // 3. Route to login with the chosen role
    navigateTo('login', { defaultRole: window.signupRole });

    // 4. Pre-fill username on login form
    setTimeout(() => {
        const loginUserInput = document.getElementById('username') || document.getElementById('login-username');
        if (loginUserInput && fullName) {
            loginUserInput.value = fullName;
            loginUserInput.focus();
        }
    }, 250);
};
// ==========================================
// SERVICES PAGE LOGIC
// ==========================================
function initServices(params) {
    if (params && params.openCategory) {
        // Direct open if modal helper is ready
        setTimeout(() => {
            if (typeof window.openCategoryModal === 'function') {
                window.openCategoryModal(params.openCategory);
            }
        }, 150);
    }
}

window.handleServicesSearch = function() {
    const query = document.getElementById('services-page-search').value.toLowerCase();
    if (!query) return;

    const match = categories.find(cat => cat.toLowerCase().includes(query));
    if (match) {
        initServices({ openCategory: match });
    } else {
        showPopup("No categories found for that search.", "info");
    }
};

const categoryDetails = {
    'Electrician': [
        'Wiring, MCB repairs, light and fan fittings.',
        'Switchboard maintenance and electrical troubleshooting.',
        'Now Trending: Smart switchboards and energy-efficient fittings.'
    ],
    'Plumber': [
        'Pipe leak repairs, blockages, and water systems.',
        'Bathroom fittings, taps, and water heater installation.',
        'Now Trending: Water-saving showerheads and modern fixtures.'
    ],
    'Mechanic': [
        'On-demand vehicle repair and periodic servicing.',
        'Battery jumpstarts, flat tires, and engine diagnostics.',
        'Now Trending: Pre-monsoon vehicle health checks.'
    ],
    'Cleaner': [
        'Deep cleaning for homes, apartments, and offices.',
        'Sofa, carpet, and intensive bathroom sanitation.',
        'Now Trending: Eco-friendly and pet-safe cleaning products.'
    ],
    'Carpenter': [
        'Custom furniture building, assembly, and repairs.',
        'Door locks, hinges, and structural woodworking.',
        'Now Trending: Space-saving modular furniture setups.'
    ],
    'Painter': [
        'Interior and exterior wall painting and touch-ups.',
        'Waterproofing, putty works, and texture painting.',
        'Now Trending: Odorless, washable, and anti-bacterial paints.'
    ],
    'Home Shifting': [
        'Safe, hassle-free packing, moving, and unloading.',
        'Careful handling of fragile items and electronics.',
        'Now Trending: End-to-end relocation with professional unboxing.'
    ],
    'Appliance Repair': [
        'AC, refrigerator, washing machine, and TV fixes.',
        'Genuine spare parts and post-repair warranties.',
        'Now Trending: Comprehensive AC deep servicing before summer.'
    ]
};

window.openCategoryModal = function(title) {
    const modal = document.getElementById('service-category-modal');
    if (!modal) return;

    document.getElementById('modal-cat-title').textContent = title;
    
    const bulletsContainer = document.getElementById('modal-cat-bullets');
    bulletsContainer.innerHTML = ''; 
    const bullets = categoryDetails[title] || ['Professional and reliable service.', '100% satisfaction guaranteed.'];
    
    bullets.forEach(bullet => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.alignItems = 'flex-start';
        li.style.gap = '12px';
        
        li.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#004AC6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0; margin-top: 2px;">
                <path d="M20 6 9 17l-5-5"/>
            </svg>
            <span style="color: #434655;">${bullet}</span>
        `;
        bulletsContainer.appendChild(li);
    });
    
    const randomImgId = Math.floor(Math.random() * 200) + 100;
    document.getElementById('modal-cat-img').src = `https://picsum.photos/600/800?random=${randomImgId}`;

    const viewBtn = document.getElementById('modal-view-provider-btn');
    viewBtn.onclick = function() {
        modal.style.display = 'none';
        
        if (appState.isLoggedIn) {
            navigateTo('findProvider', { filterCategory: title });
        } else {
            showPopup("Login first to find the provider", "info");
            navigateTo('login', { redirectAfterLogin: 'findProvider', filterCategory: title });
        }
    };

    modal.style.display = 'flex';
};





function updateNotificationBadge() {
    const badge = document.getElementById('notification-badge');
    if (!badge) return;
    const hasUnread = appState.notifications.some(n => !n.read);
    if (hasUnread) {
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function renderNotifications() {
    const listEl = document.getElementById('notification-list');
    if (!listEl) return;

    listEl.innerHTML = '';

    if (!appState.notifications || appState.notifications.length === 0) {
        listEl.innerHTML = '<div class="notif-empty">No notifications yet</div>';
        updateNotificationBadge();
        return;
    }

    const reversed = [...appState.notifications].reverse();

    reversed.forEach(item => {
        let iconSvg = '';
        if (item.type === 'rate') {
            iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
        } else if (item.type === 'cancelled') {
            iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#BA1A1A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
        } else {
            iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';
        }

        const row = document.createElement('div');
        row.className = `notif-item ${item.read ? '' : 'unread'}`;
        row.onclick = () => handleNotificationClick(item.id);
        row.innerHTML = `
            <span class="notif-dot"></span>
            <div class="notif-icon-circle">${iconSvg}</div>
            <div class="notif-text">
                <p class="notif-title">${item.title}</p>
                <p class="notif-time">${item.time}</p>
            </div>
        `;
        listEl.appendChild(row);
    });

    updateNotificationBadge();
}

function handleNotificationClick(id) {
    const item = appState.notifications.find(n => n.id === id);
    if (item) {
        item.read = true;
    }
    renderNotifications();
    updateNotificationBadge();

    const dropdown = document.getElementById('notification-dropdown');
    if (dropdown) dropdown.classList.add('hidden');

    if (item && item.route) {
        navigateTo(item.route, item.routeParams || {});
    }
}

window.handleViewProvidersDirect = function(categoryName) {
    if (appState.isLoggedIn) {
        navigateTo('findProvider', { filterCategory: categoryName });
    } else {
        showPopup("Login first to find the provider", "info");
        navigateTo('login', { redirectAfterLogin: 'findProvider', filterCategory: categoryName });
    }
};


// ==========================================
// DASHBOARD LOGIC
// ==========================================
// ==========================================
// DASHBOARD LOGIC
// ==========================================
function initDashboard() {
    const welcomeHeading = document.getElementById('dash-welcome-heading');
    const displayName = (appState.currentUser && appState.currentUser.name) ? appState.currentUser.name : 'Aarav';
    if (welcomeHeading) {
        welcomeHeading.textContent = `Welcome back, ${displayName}! 👋`;
    }

    // Allow pressing Enter in search bar
    const searchInput = document.getElementById('dashboard-search-input');
    if (searchInput) {
        searchInput.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleDashboardSearch();
            }
        };
    }

    const activeContainer = document.getElementById('active-booking-container');
    if (activeContainer) {
        if (!appState.activeBooking) {
            activeContainer.innerHTML = `
                <div class="active-booking-card" style="justify-content: center; text-align: center;">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 16px; width: 100%;">
                        <p style="color: var(--text-body); font-size: 16px; margin: 0;">No active bookings yet</p>
                        <button class="btn btn-outline-primary" onclick="navigateTo('findProvider')">Book a Service Now</button>
                    </div>
                </div>
            `;
        } else {
            const b = appState.activeBooking;
            activeContainer.innerHTML = `
                <div class="active-booking-card">
                    <div class="booking-left">
                        <div class="booking-icon-circle">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="22"/><path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/><path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/></svg>
                        </div>
                        <div class="booking-details">
                            <h3 class="booking-title">${b.service}</h3>
                            <p class="booking-provider">${b.provider}</p>
                            <div class="booking-status-row">
                                <span class="status-dot"></span>
                                <span class="status-text">Provider is on the way</span>
                            </div>
                        </div>
                    </div>
                    <div class="booking-right" style="display: flex; gap: 12px; align-items: center;">
                        <button class="btn btn-outline-primary" onclick="markServiceCompleted()" style="padding: 8px 16px; font-size: 14px;">Mark Completed</button>
                        <button class="btn track-btn" onclick="navigateTo('liveTrackingCustomer')">Track Provider</button>
                    </div>
                </div>
            `;
        }
    }

    const recentList = document.getElementById('recent-bookings-list');
    if (recentList) {
        recentList.innerHTML = '';
        appState.bookingsHistory.forEach(item => {
            const isCompleted = item.status === 'Completed';
            const badgeClass = isCompleted ? 'badge-completed' : 'badge-cancelled';
            
            const actionButton = isCompleted 
                ? `<button class="btn btn-outline-primary" onclick="navigateTo('ratingReview', { serviceName: '${item.service}' })">Rate Your Service</button>`
                : `<button class="btn btn-outline-primary">View Details</button>`;

            recentList.innerHTML += `
                <div class="list-booking-card">
                    <div class="booking-left">
                        <div class="booking-icon-circle">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                        </div>
                        <div class="booking-details">
                            <h3 class="booking-title">${item.service}</h3>
                            <p class="booking-provider">${item.provider}</p>
                            <p class="booking-date">${item.date}</p>
                        </div>
                    </div>
                    <div class="booking-right booking-right-actions">
                        <span class="booking-price">${item.price}</span>
                        <span class="status-badge ${badgeClass}">${item.status}</span>
                        ${actionButton}
                    </div>
                </div>
            `;
        });
    }
}
window.handleDashboardSearch = function() {
    const input = document.getElementById('dashboard-search-input');
    if (!input) return;
    const query = input.value.trim().toLowerCase();
    if (!query) return;

    // Normalize synonyms (e.g., "cleaning" -> "Cleaner", "ac" -> "Appliance Repair")
    const match = categories.find(cat => {
        const c = cat.toLowerCase();
        if (c.includes(query) || query.includes(c)) return true;
        if (query.includes('clean') && c === 'cleaner') return true;
        if (query.includes('carpenter') && c === 'carpenter') return true;
        if (query.includes('carpent') && c === 'carpenter') return true;
        if ((query.includes('ac') || query.includes('repair')) && c === 'appliance repair') return true;
        if ((query.includes('shift') || query.includes('move')) && c === 'home shifting') return true;
        return false;
    });

    if (match) {
        navigateTo('services', { openCategory: match });
    } else {
        navigateTo('services');
    }
};

document.addEventListener('click', function(e) {
    const avatarBtn = document.querySelector('.dash-avatar');
    const dropdown = document.getElementById('customer-profile-dropdown');
    if (!dropdown || !avatarBtn) return;

    if (avatarBtn.contains(e.target)) {
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    } else if (!dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});

window.handleCustomerLogout = function() {
    appState.isLoggedIn = false;
    appState.role = null;
    appState.activeBooking = null;
    const dropdown = document.getElementById('customer-profile-dropdown');
    if (dropdown) dropdown.style.display = 'none';
    navigateTo('home');
};

// ==========================================
// FIND A PROVIDER LOGIC (Map & Filters)
// ==========================================

// ==========================================
// FIND A PROVIDER LOGIC (Map & Filters)
// ==========================================

// ==========================================
// FIND A PROVIDER LOGIC (Map & Filters)
// ==========================================
window.selectedCategoryFilter = null;

window.handleBookNow = function(providerId) {
    const selected = providers.find(p => p.id === providerId);
    if (selected) {
        appState.selectedProvider = selected;
    }
    navigateTo('bookingService');
};

window.handleViewProfile = function(providerId) {
    const selected = providers.find(p => p.id === providerId);
    if (selected) {
        appState.selectedProvider = selected;
    }
    navigateTo('providerProfile');
};

// Toggle the 8-category panel open/close
window.toggleCategoryFilters = function() {
    const panel = document.getElementById('fap-categories-panel');
    if (!panel) return;

    if (panel.style.display === 'none' || panel.style.display === '') {
        panel.style.display = 'block';
        renderCategoryChips();
    } else {
        panel.style.display = 'none';
    }
};

// Render the 8 category buttons
window.renderCategoryChips = function() {
    const container = document.getElementById('fap-category-chips');
    if (!container) return;

    container.innerHTML = '';
    categories.forEach(cat => {
        const chip = document.createElement('div');
        const isSelected = window.selectedCategoryFilter === cat;
        chip.className = `fap-chip ${isSelected ? 'chip-selected' : ''}`;
        chip.style.cursor = 'pointer';
        chip.style.userSelect = 'none';
        chip.textContent = cat;

        chip.onclick = () => {
            // Toggle selection
            if (window.selectedCategoryFilter === cat) {
                window.selectedCategoryFilter = null;
            } else {
                window.selectedCategoryFilter = cat;
            }
            renderCategoryChips();
            renderProvidersList();
        };

        container.appendChild(chip);
    });
};

// Reset category selection
window.clearCategoryFilter = function() {
    window.selectedCategoryFilter = null;
    renderCategoryChips();
    renderProvidersList();
};

function initFindProvider(params) {
    setTimeout(() => {
        const mapDiv = document.getElementById('map');
        if (!mapDiv) return;

        if (window.fapMap) {
            window.fapMap.remove();
            window.fapMap = null;
        }
        
        window.fapMap = L.map('map', { zoomControl: false }).setView([27.7000, 83.4486], 13);

        // OpenStreetMap tiles (removes the "API KEY REQUIRED" watermark)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap'
        }).addTo(window.fapMap);

        L.control.zoom({ position: 'bottomright' }).addTo(window.fapMap);

        const userIcon = L.divIcon({
            className: 'fap-user-marker',
            html: 'You',
            iconSize: [44, 24],
            iconAnchor: [22, 12]
        });
        L.marker([27.7000, 83.4486], { icon: userIcon }).addTo(window.fapMap);

        window.providerMarkers = [];

        setTimeout(() => { if (window.fapMap) window.fapMap.invalidateSize(); }, 50);

        const queryInput = document.getElementById('global-query-input');
        if (params && params.filterCategory && queryInput) {
            queryInput.value = params.filterCategory;
        }

        const chips = document.querySelectorAll('#fap-filter-chips .fap-chip[data-filter]');
        chips.forEach(chip => {
            const newChip = chip.cloneNode(true);
            chip.parentNode.replaceChild(newChip, chip);
            newChip.addEventListener('click', function() {
                this.classList.toggle('chip-selected');
                renderProvidersList(); 
            });
        });

        renderProvidersList();

    }, 300);
}

function renderProvidersList() {
    const listContainer = document.getElementById('dynamic-provider-list');
    const countHeader = document.getElementById('fap-count');
    const queryInput = document.getElementById('global-query-input');
    const query = queryInput ? queryInput.value.trim().toLowerCase() : '';

    if (!listContainer || !countHeader) return;

    listContainer.innerHTML = '';
    
    if (window.providerMarkers) {
        window.providerMarkers.forEach(m => m.remove());
    }
    window.providerMarkers = [];

    const chipsContainer = document.getElementById('fap-filter-chips');
    const existingQueryChip = document.getElementById('query-filter-chip');
    if (existingQueryChip) existingQueryChip.remove();

    if (query && chipsContainer) {
        const queryChip = document.createElement('div');
        queryChip.id = 'query-filter-chip';
        queryChip.className = 'fap-chip chip-selected';
        queryChip.innerHTML = `${query} <span class="chip-remove" style="margin-left: 6px; font-weight: bold; cursor: pointer;">&times;</span>`;
        
        queryChip.querySelector('.chip-remove').onclick = (e) => {
            e.stopPropagation();
            queryInput.value = '';
            renderProvidersList();
        };
        chipsContainer.insertBefore(queryChip, chipsContainer.firstChild);
    }

    const topRatedActive = document.querySelector('[data-filter="top-rated"]')?.classList.contains('chip-selected');
    const availableNowActive = document.querySelector('[data-filter="available-now"]')?.classList.contains('chip-selected');
    const under1000Active = document.querySelector('[data-filter="under-1000"]')?.classList.contains('chip-selected');

    const filteredProviders = providers.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query);
        if (!matchesSearch) return false;

        // Category filter check
        if (window.selectedCategoryFilter && p.category !== window.selectedCategoryFilter) {
            return false;
        }

        if (topRatedActive && parseFloat(p.rating) < 4.5) return false;
        if (availableNowActive && p.online !== true) return false;
        if (under1000Active && p.pricePerHour > 1000) return false;

        return true;
    });

    countHeader.textContent = `${filteredProviders.length} Providers found`;

    const providerIcon = L.divIcon({
        className: 'fap-provider-marker',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });

    filteredProviders.forEach(p => {
        if (!p.lat) {
            p.lat = 27.7000 + (Math.random() - 0.5) * 0.05;
            p.lng = 83.4486 + (Math.random() - 0.5) * 0.05;
        }

        const onlineDotHTML = p.online ? `<span class="fap-online-dot" aria-label="Online"></span>` : '';
        const bookBtnHTML = p.online ? `<button class="fap-btn-book" onclick="handleBookNow('${p.id}')">Book Now</button>` : '';

        const card = document.createElement('div');
        card.className = 'fap-card';
        card.innerHTML = `
            <div class="fap-card-top">
                <div class="fap-avatar-wrapper">
                    <img src="${p.avatarUrl}" alt="${p.name}" class="fap-avatar">
                    ${onlineDotHTML}
                </div>
                <div class="fap-card-info">
                    <div class="fap-card-header-row">
                        <h3 class="fap-name">
                            ${p.name} 
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#004AC6" stroke="#FFFFFF" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                        </h3>
                        <div class="fap-price">Rs. ${p.pricePerHour}<span>/hr</span></div>
                    </div>
                    <p class="fap-subtext">${p.category} Professional</p>
                    <div class="fap-card-stats">
                        <div class="fap-stat-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            <span class="fap-rating"><strong>${p.rating}</strong> <span class="fap-rating-count">(${p.reviewCount})</span></span>
                        </div>
                        <div class="fap-stat-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#737686" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/><path d="M13 6h-2c-1.1 0-2 .9-2 2v4h2v7h2v-7h2V8c0-1.1-.9-2-2-2z"/></svg>
                            <span class="fap-distance">${p.distance}km</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="fap-card-bottom">
                <div class="fap-card-actions">
                    ${bookBtnHTML}
                    <button class="fap-btn-profile" onclick="handleViewProfile('${p.id}')">View Profile</button>
                </div>
            </div>
        `;
        listContainer.appendChild(card);

        if (window.fapMap) {
            const marker = L.marker([p.lat, p.lng], { icon: providerIcon }).addTo(window.fapMap);
            marker.bindPopup(`
                <div class="fap-map-popup">
                    <div class="fap-popup-name">${p.name}</div>
                    <div class="fap-popup-rating">★ ${p.rating}</div>
                </div>
            `, { closeButton: false, offset: [0, -6] });
            window.providerMarkers.push(marker);
        }
    }); 
}


window.handleHeaderGlobalSearch = function() {
    const queryInput = document.getElementById('global-query-input');
    const query = queryInput ? queryInput.value.trim() : '';

    // If we are already on find-a-provider page, just filter immediately
    if (document.getElementById('dynamic-provider-list')) {
        renderProvidersList();
    } else {
        // If on Dashboard or Home, navigate to findProvider with the search query
        navigateTo('findProvider', { filterCategory: query });
    }
};
// ==========================================
// BOOKING SERVICE LOGIC
// ==========================================
// ==========================================
// BOOKING SERVICE LOGIC
// ==========================================
function initBookingService() {
    const provider = appState.selectedProvider || {
        name: 'Suman Technical',
        category: 'Electrician',
        pricePerHour: 1000,
        rating: '4.9',
        reviewCount: 120,
        avatarUrl: 'https://picsum.photos/100?random=99'
    };

    const titleEl = document.getElementById('booking-service-title');
    const catEl = document.getElementById('booking-service-category');
    const priceEl = document.getElementById('booking-service-price');
    const sumNameEl = document.getElementById('summary-provider-name');
    const sumAvatarEl = document.getElementById('summary-provider-avatar');
    const sumRatingEl = document.getElementById('summary-provider-rating');
    const sumServEl = document.getElementById('summary-service-name');
    const sumFeeEl = document.getElementById('summary-fee-value');
    const sumTotalEl = document.getElementById('summary-total-value');

    if (titleEl) titleEl.textContent = `${provider.category} Service`;
    if (catEl) catEl.textContent = `${provider.name} Professional Standard`;
    if (priceEl) priceEl.textContent = `Rs. ${provider.pricePerHour}`;
    
    if (sumNameEl) sumNameEl.textContent = provider.name;
    if (sumAvatarEl) sumAvatarEl.src = provider.avatarUrl;
    if (sumRatingEl) sumRatingEl.textContent = `${provider.rating} (${provider.reviewCount}+ jobs)`;
    if (sumServEl) sumServEl.textContent = provider.category;
    
    if (sumFeeEl) sumFeeEl.textContent = `Rs. ${provider.pricePerHour}`;
    
    const platformFee = 50;
    const totalVal = Number(provider.pricePerHour) + platformFee;
    if (sumTotalEl) sumTotalEl.textContent = `Rs. ${totalVal.toLocaleString()}`;

    // --- Dynamic Date & Time State & Handlers ---
    let selectedDateTimeText = 'Aug 12, 2026 • 11:30 AM';
    let selectedAddressText = 'Butwal, Nepal';

    const dtDisplay = document.getElementById('booking-datetime-display');
    const dtInput = document.getElementById('booking-datetime-input');
    const dtCard = document.getElementById('schedule-card-wrapper');
    const sumDt = document.getElementById('summary-datetime-value');

    if (dtCard && dtDisplay && dtInput) {
        dtCard.onclick = (e) => {
            if (e.target === dtInput) return;
            dtDisplay.style.display = 'none';
            dtInput.style.display = 'block';
            dtInput.focus();
            if (typeof dtInput.showPicker === 'function') {
                try { dtInput.showPicker(); } catch (err) {}
            }
        };

        dtInput.onchange = () => {
            if (!dtInput.value) return;
            const dateObj = new Date(dtInput.value);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const formattedDate = `${months[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;
            
            let hours = dateObj.getHours();
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            const formattedTime = `${hours}:${minutes} ${ampm}`;

            selectedDateTimeText = `${formattedDate} • ${formattedTime}`;
            dtDisplay.textContent = `${formattedDate} - ${formattedTime}`;
            if (sumDt) sumDt.textContent = `${formattedDate} / ${formattedTime}`;
            
            dtInput.style.display = 'none';
            dtDisplay.style.display = 'block';
        };

        dtInput.onblur = () => {
            setTimeout(() => {
                dtInput.style.display = 'none';
                dtDisplay.style.display = 'block';
            }, 150);
        };
    }

    // --- Dynamic Address State & Handlers ---
    const addrDisplay = document.getElementById('booking-address-display');
    const addrInput = document.getElementById('booking-address-input');
    const addrCard = document.getElementById('location-card-wrapper');
    const sumAddr = document.getElementById('summary-address-value');

    if (addrCard && addrDisplay && addrInput) {
        addrCard.onclick = (e) => {
            if (e.target === addrInput) return;
            addrDisplay.style.display = 'none';
            addrInput.style.display = 'block';
            addrInput.value = selectedAddressText;
            addrInput.focus();
        };

        const saveAddress = () => {
            const val = addrInput.value.trim();
            if (val) {
                selectedAddressText = val;
                addrDisplay.textContent = val;
                if (sumAddr) sumAddr.textContent = val;
            }
            addrInput.style.display = 'none';
            addrDisplay.style.display = 'block';
        };

        addrInput.onblur = saveAddress;
        addrInput.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveAddress();
            }
        };
    }

    // --- Photos Upload Handling ---
    const fileInput = document.getElementById('photo-upload');
    const dropzone = document.getElementById('photo-upload-dropzone');
    const previewContainer = document.getElementById('photo-preview-container');

    if (fileInput && dropzone && previewContainer) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        dropzone.addEventListener('drop', (e) => {
            handleFiles(e.dataTransfer.files);
        }, false);

        fileInput.addEventListener('change', function() {
            handleFiles(this.files);
        });

        function handleFiles(files) {
            previewContainer.innerHTML = '';
            Array.from(files).forEach(file => {
                if (!file.type.match('image.*')) return;
                const reader = new FileReader();
                reader.onload = function(e) {
                    const thumbWrapper = document.createElement('div');
                    thumbWrapper.style.cssText = 'position:relative; width:64px; height:64px; border-radius:8px; overflow:hidden; border:1px solid #C3C6D7;';
                    thumbWrapper.innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
                    previewContainer.appendChild(thumbWrapper);
                };
                reader.readAsDataURL(file);
            });
        }
    }

    // --- Confirm Booking Button ---
    const confirmBtn = document.getElementById('confirm-booking-btn');
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            const issueDesc = document.getElementById('booking-issue-desc')?.value || '';

            appState.activeBooking = {
                service: `${provider.category} Service`,
                provider: provider.name,
                price: `Rs. ${totalVal.toLocaleString()}`,
                date: selectedDateTimeText,
                address: selectedAddressText,
                issue: issueDesc,
                fee: provider.pricePerHour,
                total: totalVal
            };

            showPopup("Booking confirmed successfully!", "success");
            setTimeout(() => {
                navigateTo('payment');
            }, 300);
        };
    }
}




// ==========================================
// SIMULATED PAYMENT LOGIC
// ==========================================
function initPayment() {
    // 1. Fetch Dynamic Price
    let totalAmount = 1050; // Fallback
    if (appState.activeBooking && appState.activeBooking.total) {
        totalAmount = appState.activeBooking.total;
    }
    
    const formattedTotal = `Rs. ${totalAmount.toLocaleString()}`;
    
    // Inject Price into UI
    const totalValueEl = document.getElementById('payment-total-value');
    const payBtnEl = document.getElementById('payment-pay-btn');
    
    if (totalValueEl) totalValueEl.textContent = formattedTotal;
    if (payBtnEl) {
        payBtnEl.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Pay ${formattedTotal}`;
    }

    // 2. Payment Method Selection Logic
    const cards = document.querySelectorAll('.payment-method-card');
    appState.selectedPayment = 'eSewa'; // Default selection

    cards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove 'selected' state and border from all cards
            cards.forEach(c => {
                c.classList.remove('selected');
                c.style.border = '1px solid #C3C6D7';
                c.style.background = 'transparent';
                const textSpan = c.querySelector('.method-name');
                if (textSpan) textSpan.style.color = '#505F76';
                
                const existingBadge = c.querySelector('.selected-badge');
                if (existingBadge) existingBadge.remove();
            });
            
            // Add 'selected' state to clicked card
            this.classList.add('selected');
            this.style.border = '2px solid #004AC6';
            this.style.background = 'rgba(219, 225, 255, 0.3)';
            const textSpan = this.querySelector('.method-name');
            if (textSpan) textSpan.style.color = '#131B2E';
            
            // Inject the blue checkmark badge
            const badgeHTML = `
                <div class="selected-badge" style="position: absolute; top: -8px; right: -8px; background: #004AC6; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
            `;
            this.insertAdjacentHTML('afterbegin', badgeHTML);

            // Update app state
            appState.selectedPayment = this.getAttribute('data-method');
        });
    });

    // 3. Confirm Payment Button
  if (payBtnEl) {
        payBtnEl.onclick = () => {
            if (appState.activeBooking) {
                const trackNotif = {
                    id: 'track-' + Date.now(),
                    type: 'track',
                    title: `Track your ${appState.activeBooking.service} booking — ${appState.activeBooking.provider} is on the way`,
                    time: 'Just now',
                    read: false,
                    route: 'liveTrackingCustomer',
                    routeParams: {}
                };
                appState.notifications.push(trackNotif);
                updateNotificationBadge();
            }

            setTimeout(() => {
                navigateTo('bookingConfirmed');
            }, 400);
        };
    }
}




// ==========================================
// BOOKING CONFIRMED LOGIC
// ==========================================
function initBookingConfirmed() {
    // 1. Show the success popup on load
    const paymentMethod = appState.selectedPayment || 'eSewa';
    showPopup(`Payment successful!`, 'success');

    // 2. Fetch the active booking details
    const booking = appState.activeBooking || {
        provider: 'Suman Technical',
        service: 'Electrician Service',
        date: 'Aug 12, 2026 • 11:30 AM',
        address: 'Butwal, Nepal'
    };

    // 3. Generate a random Booking ID
    const randomId = 'SAM-' + Math.floor(10000 + Math.random() * 90000);
    
    // 4. Populate the UI elements
    const idEl = document.getElementById('conf-id');
    const provEl = document.getElementById('conf-provider');
    const servEl = document.getElementById('conf-service');
    const dateEl = document.getElementById('conf-date');
    const locEl = document.getElementById('conf-location');

    if (idEl) idEl.textContent = randomId;
    if (provEl) provEl.textContent = booking.provider;
    if (servEl) servEl.textContent = booking.service;
    if (dateEl) dateEl.textContent = booking.date;
    if (locEl) locEl.textContent = booking.address;
}




// ==========================================
// BOOKING RECEIPT LOGIC
// ==========================================
function initBookingReceipt() {
    // 1. Fetch active booking
    const booking = appState.activeBooking;
    if (!booking) return; // Prevent crash if visited directly

    // 2. Generate Random TXN ID
    const txnId = 'TXN-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000);
    const txnEl = document.getElementById('receipt-txn-id');
    if (txnEl) txnEl.textContent = txnId;

    // 3. Inject details into UI
    const servName = document.getElementById('receipt-service-name');
    const servDesc = document.getElementById('receipt-service-desc');
    const dateEl = document.getElementById('receipt-date');
    const compEl = document.getElementById('receipt-company');
    const baseFee = document.getElementById('receipt-base-fee');
    const totalEl = document.getElementById('receipt-total');
    const walletText = document.getElementById('receipt-wallet-text');
    const avatarEl = document.getElementById('receipt-avatar');

    if (servName) servName.textContent = booking.service;
    if (servDesc) {
        let desc = booking.address;
        if (booking.issue && booking.issue.trim() !== '') {
            desc += ` • ${booking.issue}`;
        }
        servDesc.textContent = desc;
    }
    if (dateEl) dateEl.textContent = booking.date;
    if (compEl) compEl.textContent = booking.provider;
    
    // Attempt to pull the matching avatar from the selected provider object
    if (avatarEl && appState.selectedProvider && appState.selectedProvider.avatarUrl) {
        avatarEl.src = appState.selectedProvider.avatarUrl;
    }

    if (baseFee) baseFee.textContent = `Rs. ${Number(booking.fee).toLocaleString()}`;
    if (totalEl) totalEl.textContent = booking.price; // Already formatted as "Rs. XXXX"

    // Set Payment Method Text
    const paymentMethod = appState.selectedPayment || 'eSewa';
    if (walletText) walletText.textContent = `Paid via ${paymentMethod}`;
}

// Handles clicking "Go to Dashboard"
window.handleFinishBooking = function() {
    if (appState.activeBooking) {
        // 1. Unshift pushes the new booking to the TOP of the history array
        appState.bookingsHistory.unshift({
            service: appState.activeBooking.service,
            provider: appState.activeBooking.provider,
            date: appState.activeBooking.date,
            price: appState.activeBooking.price,
            status: 'Completed'
        });
        
        // 2. Clear out the active booking state
        appState.activeBooking = null;
        appState.selectedProvider = null;
        appState.selectedPayment = null;
    }
    
    // 3. Go back to Dashboard (the new booking will now appear in "Recent Bookings")
    navigateTo('dashboard');
};


// Handles clicking "Go to Dashboard" from the receipt
window.handleFinishBooking = function() {
    // We intentionally DO NOT clear appState.activeBooking here.
    // Leaving it intact ensures it shows up in the "Active Bookings" 
    // sector of the dashboard with the "Track Provider" button!
    
    // Just navigate straight to the dashboard
    navigateTo('dashboard');
};







// ==========================================
// CUSTOM ACTION: MARK SERVICE COMPLETED
// ==========================================
window.markServiceCompleted = function() {
    if (appState.activeBooking) {
        // 1. Move the active booking into the history array
        appState.bookingsHistory.unshift({
            service: appState.activeBooking.service,
            provider: appState.activeBooking.provider,
            date: appState.activeBooking.date,
            price: appState.activeBooking.price,
            status: 'Completed'
        });
        
        // 2. Clear the active booking
        appState.activeBooking = null;
        
        // 3. Show a nice popup
        showPopup("Service marked as completed!", "success");
        
        // 4. Instantly refresh the dashboard to show the changes
        initDashboard();
    }
};





// ==========================================
// LIVE TRACKING (CUSTOMER) LOGIC
// ==========================================
function initLiveTrackingCustomer() {
    // 1. Populate Provider Details
    const provider = appState.selectedProvider || {
        name: appState.activeBooking?.provider || 'Suman Technical Services',
        rating: '4.8',
        reviewCount: 124,
        avatarUrl: 'https://i.pravatar.cc/100?img=12'
    };

    const nameEl = document.getElementById('track-provider-name');
    const avatarEl = document.getElementById('track-provider-avatar');
    const ratingEl = document.getElementById('track-provider-rating');

    if (nameEl) nameEl.textContent = provider.name;
    if (avatarEl) avatarEl.src = provider.avatarUrl;
    if (ratingEl) ratingEl.textContent = `${provider.rating} (${provider.reviewCount} reviews)`;

    // 2. Initialize Leaflet Map
    // We use a 300ms timeout to ensure the DOM is fully painted by the router
    setTimeout(() => {
        const mapDiv = document.getElementById('tracking-map');
        if (!mapDiv) return;

        // Safely destroy existing map instance if routing back and forth
        if (window.trackMap) {
            window.trackMap.remove();
            window.trackMap = null;
        }

        // Mount new map
        window.trackMap = L.map('tracking-map', { zoomControl: false }).setView([27.7000, 83.4486], 14);
        
        // Use OpenStreetMap to completely avoid CARTO watermark
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap'
        }).addTo(window.trackMap);

        L.control.zoom({ position: 'bottomright' }).addTo(window.trackMap);

        // Dashed Route Polyline
        const routeCoords = [
            [27.7050, 83.4470], // Start (Provider location)
            [27.6950, 83.4500]  // End (Customer location)
        ];
        
        L.polyline(routeCoords, {
            color: '#2563EB',
            weight: 4,
            dashArray: '8, 8'
        }).addTo(window.trackMap);

        // Custom Markers
        const startIcon = L.divIcon({
            className: 'map-start-marker',
            html: '<div style="background:#004AC6; width:16px; height:16px; border-radius:50%; border:3px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
        });

        const endIcon = L.divIcon({
            className: 'map-end-marker',
            html: '<div style="background:#166534; width:16px; height:16px; border-radius:50%; border:3px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
        });

        L.marker(routeCoords[0], { icon: startIcon }).addTo(window.trackMap); 
        L.marker(routeCoords[1], { icon: endIcon }).addTo(window.trackMap); 

        // Force resize check to guarantee tiles pop in
        setTimeout(() => { if (window.trackMap) window.trackMap.invalidateSize(); }, 50);

    }, 300);
}





// ==========================================
// RATING & REVIEW LOGIC
// ==========================================
function initRatingReview(params) {
    let ratingValue = 0; // Starts at 0 stars

    // 1. Populate Dynamic Data
    // Find the specific booking passed from the dashboard button, or use fallback
    const targetServiceName = params?.serviceName || '';
    let bookingToReview = appState.bookingsHistory.find(b => b.service === targetServiceName);
    
    if (!bookingToReview) {
        bookingToReview = {
            service: 'General Service',
            provider: 'SAMHAL Professional',
            date: 'Recently'
        };
    }

    const nameEl = document.getElementById('review-service-name');
    const metaEl = document.getElementById('review-service-meta');
    const questionEl = document.getElementById('review-question');

    if (nameEl) nameEl.textContent = bookingToReview.service;
    if (metaEl) metaEl.innerHTML = `by ${bookingToReview.provider} &middot; ${bookingToReview.date.split(' •')[0]}`;
    if (questionEl) questionEl.textContent = `How was your experience with ${bookingToReview.provider}?`;

    // 2. Interactive Star Logic
    const stars = document.querySelectorAll('.star-interactive');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const val = parseInt(this.getAttribute('data-val'));
            ratingValue = val; // Store the rating
            
            // Loop through all stars and update styling
            stars.forEach(s => {
                const sVal = parseInt(s.getAttribute('data-val'));
                if (sVal <= val) {
                    s.setAttribute('fill', '#F59E0B');
                    s.setAttribute('stroke', '#F59E0B');
                } else {
                    s.setAttribute('fill', 'none');
                    s.setAttribute('stroke', '#C3C6D7');
                }
            });
        });
    });

    // 3. File Input & Drag-and-Drop Logic
    const fileInput = document.getElementById('review-photo-upload');
    const dropzone = document.getElementById('review-photo-dropzone');
    const previewContainer = document.getElementById('review-photo-preview');

    if (fileInput && dropzone && previewContainer) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        dropzone.addEventListener('dragover', () => {
            dropzone.style.borderColor = '#004AC6';
            dropzone.style.backgroundColor = '#E2E7FF';
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.style.borderColor = '#C3C6D7';
            dropzone.style.backgroundColor = '#F8F9FC';
        });

        dropzone.addEventListener('drop', (e) => {
            dropzone.style.borderColor = '#C3C6D7';
            dropzone.style.backgroundColor = '#F8F9FC';
            handleFiles(e.dataTransfer.files);
        });

        fileInput.addEventListener('change', function() {
            handleFiles(this.files);
        });

        function handleFiles(files) {
            previewContainer.innerHTML = '';
            Array.from(files).forEach(file => {
                if (!file.type.match('image.*')) return;
                const reader = new FileReader();
                reader.onload = function(e) {
                    const thumbWrapper = document.createElement('div');
                    thumbWrapper.style.cssText = 'position:relative; width:64px; height:64px; border-radius:8px; overflow:hidden; border:1px solid #C3C6D7;';
                    thumbWrapper.innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
                    previewContainer.appendChild(thumbWrapper);
                }
                reader.readAsDataURL(file);
            });
        }
    }

    // 4. Submit Button Logic
    const submitBtn = document.getElementById('review-submit-btn');
    if (submitBtn) {
        submitBtn.onclick = () => {
            if (ratingValue === 0) {
                showPopup("Please select a star rating first.", "error");
                return;
            }
            showPopup("Review submitted successfully! Thank you.", "success");
            setTimeout(() => {
                navigateTo('dashboard');
            }, 600);
        };
    }
}




// ==========================================
// HOW IT WORKS PAGE LOGIC
// ==========================================
function initHowItWorks() {
    // Select the CTA section at the bottom of the page
    const ctaSection = document.getElementById('hiw-cta-section');
    
    if (ctaSection) {
        // If the user is logged in, hide the "Ready to get started?" banner completely
        if (appState.isLoggedIn) {
            ctaSection.style.display = 'none';
        } else {
            ctaSection.style.display = 'block';
        }
    }
}

// ==========================================
// BECOME A PROVIDER LOGIC
// ==========================================
// ==========================================
// BECOME A PROVIDER - MODAL TRIGGER FIX
// ==========================================
// ==========================================
// BECOME A PROVIDER - MODAL TRIGGER FIX
// ==========================================
window.handleProviderSignup = function() {
    // 1. Try triggering global modal functions if they exist in index.html scope
    if (typeof openAuthModal === 'function') {
        openAuthModal('signup', 'provider');
        return;
    }
    if (typeof showAuthModal === 'function') {
        showAuthModal('signup', 'provider');
        return;
    }

    // 2. Check if a global modal exists anywhere in the parent document and display it
    const globalModal = document.getElementById('global-signup-modal') || document.getElementById('auth-modal');
    if (globalModal) {
        globalModal.style.display = 'flex';
        window.signupRole = 'provider'; // Ensure provider role is flagged
        return;
    }

    // 3. Fallback: If no modal exists on the current DOM slice, route to login with signup params
    navigateTo('login', { openSignup: true, defaultRole: 'provider' });
};




// ==========================================
// PROVIDER PROFILE LOGIC
// ==========================================
// ==========================================
// PROVIDER PROFILE LOGIC
// ==========================================
// ==========================================
// PROVIDER PROFILE LOGIC (Context-Aware)
// ==========================================
function initProviderProfile() {
    // Determine provider name dynamically if viewing self
    const isProviderSelfView = appState.isLoggedIn && appState.role === 'provider';
    const loggedInProviderName = (appState.currentUser && appState.currentUser.name) ? appState.currentUser.name : 'Suman';

    const defaultName = isProviderSelfView ? `${loggedInProviderName} Technical Services` : 'Suman Technical Services';

    const provider = appState.selectedProvider || {
        name: defaultName,
        category: 'AC & Appliance Technician',
        pricePerHour: 1000,
        rating: '4.8',
        reviewCount: 86,
        distance: '1.2',
        avatarUrl: 'https://picsum.photos/200'
    };

    // If logged in as provider, enforce their custom business name
    if (isProviderSelfView) {
        provider.name = `${loggedInProviderName} Technical Services`;
    }

    // Populate profile elements
    const nameEl = document.getElementById('profile-name');
    const catEl = document.getElementById('profile-category');
    const ratingEl = document.getElementById('profile-rating-text');
    const distanceEl = document.getElementById('profile-distance-text');
    const priceEl = document.getElementById('profile-price-display');
    const avatarEl = document.getElementById('profile-avatar');
    const backContainer = document.getElementById('profile-back-container');
    const sidebarCard = document.getElementById('profile-sidebar-card');

    if (nameEl) nameEl.textContent = provider.name;
    if (catEl) catEl.textContent = provider.category;
    if (ratingEl) ratingEl.textContent = `${provider.rating} (${provider.reviewCount} reviews)`;
    if (distanceEl) distanceEl.textContent = `Butwal · ${provider.distance}km away`;
    if (priceEl) priceEl.textContent = `Starts at Rs. ${provider.pricePerHour}`;
    if (avatarEl) avatarEl.src = provider.avatarUrl;

    // Update "About [Name]" heading if present
    const aboutTitleEl = document.querySelector('.profile-card-title');
    const allTitles = document.querySelectorAll('.profile-card-title');
    allTitles.forEach(title => {
        if (title.textContent.includes('About')) {
            title.textContent = `About ${loggedInProviderName}`;
        }
    });

    if (isProviderSelfView) {
        // Hide back button because they didn't come from "Find a Provider"
        if (backContainer) backContainer.style.display = 'none';

        // Render "Ready to work?" sidebar card
        if (sidebarCard) {
            sidebarCard.innerHTML = `
                <h2 class="profile-card-title">Ready to work?</h2>
                <p class="profile-card-subtext">Accept jobs and grow your earnings.</p>
                <div class="hire-actions" style="margin-top: 16px;">
                    <button id="search-jobs-btn" class="btn btn-primary btn-full hire-btn-book">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" e2="16.65"/></svg>
                        Search Available Job
                    </button>
                </div>
                <hr class="profile-divider" style="margin: 20px 0;">
                <h3 class="working-hours-title" style="display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; color: #131B2E; margin-bottom: 12px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    Working Hours
                </h3>
                <div class="working-hours-list" style="display: flex; flex-direction: column; gap: 8px; font-size: 14px; color: #505F76;">
                    <div class="working-hours-row" style="display: flex; justify-content: space-between;"><span class="wh-label">Sun - Fri:</span><span class="wh-value">8:00 AM - 6:00 PM</span></div>
                    <div class="working-hours-row" style="display: flex; justify-content: space-between;"><span class="wh-label">Saturday:</span><span class="wh-value">Closed</span></div>
                </div>
            `;
            
            const searchBtn = document.getElementById('search-jobs-btn');
            if (searchBtn) {
                searchBtn.onclick = () => {
                    navigateTo('providerDashboard');
                };
            }
        }
    } else {
        // Customer view: Show back button and "Ready to hire?" card
        if (backContainer) backContainer.style.display = 'block';

        if (sidebarCard) {
            sidebarCard.innerHTML = `
                <h2 class="profile-card-title">Ready to hire?</h2>
                <p class="profile-card-subtext">Usually responds within 1 hour.</p>
                <div class="hire-actions" style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
                    <button id="profile-book-btn" class="btn btn-primary btn-full hire-btn-book" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                        Book Now
                    </button>
                    <button class="btn hire-btn-message btn-full" onclick="showPopup('Chat feature coming soon!', 'info')" style="display: flex; align-items: center; justify-content: center; gap: 8px; background: #E2E7FF; color: #004AC6; border: none; padding: 12px; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        Message
                    </button>
                </div>
                <hr class="profile-divider" style="margin: 20px 0;">
                <h3 class="working-hours-title" style="display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; color: #131B2E; margin-bottom: 12px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    Working Hours
                </h3>
                <div class="working-hours-list" style="display: flex; flex-direction: column; gap: 8px; font-size: 14px; color: #505F76;">
                    <div class="working-hours-row" style="display: flex; justify-content: space-between;"><span class="wh-label">Sun - Fri:</span><span class="wh-value">8:00 AM - 6:00 PM</span></div>
                    <div class="working-hours-row" style="display: flex; justify-content: space-between;"><span class="wh-label">Saturday:</span><span class="wh-value">Closed</span></div>
                </div>
            `;

            const bookBtn = document.getElementById('profile-book-btn');
            if (bookBtn) {
                bookBtn.onclick = () => {
                    appState.selectedProvider = provider;
                    navigateTo('bookingService');
                };
            }
        }
    }

    // Initialize Map Marker Popup with dynamic name
    setTimeout(() => {
        const mapDiv = document.getElementById('profile-map');
        if (!mapDiv) return;

        if (window.profileMapInstance) {
            window.profileMapInstance.remove();
            window.profileMapInstance = null;
        }

        const map = L.map('profile-map', { zoomControl: false }).setView([27.7000, 83.4486], 13);
        window.profileMapInstance = map;

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            maxZoom: 19
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const providerIcon = L.divIcon({
            className: 'fap-provider-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        const userIcon = L.divIcon({
            className: 'fap-user-marker',
            html: 'You',
            iconSize: [44, 24],
            iconAnchor: [22, 12]
        });

        L.marker([27.7000, 83.4486], { icon: userIcon }).addTo(map);

        const marker = L.marker([27.7150, 83.4500], { icon: providerIcon }).addTo(map);
        marker.bindPopup(`
            <div class="fap-map-popup">
                <div class="fap-popup-name">${provider.name}</div>
                <div class="fap-popup-rating">★ ${provider.rating}</div>
            </div>
        `, { closeButton: false, offset: [0, -8] }).openPopup();

        setTimeout(() => { map.invalidateSize(); }, 50);
    }, 200);
}




// ==========================================
// PROVIDER DASHBOARD LOGIC
// ==========================================
function initProviderDashboard() {
    // Dynamically update greeting if provider name exists in appState
    const nameEl = document.getElementById('pd-provider-name');
    const welcomeEl = document.getElementById('pd-welcome-heading');
    
    if (appState.currentUser && appState.currentUser.name) {
        if (nameEl) nameEl.textContent = appState.currentUser.name;
        if (welcomeEl) welcomeEl.textContent = `Welcome back ${appState.currentUser.name}`;
    }

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Toggle Online / Offline Status Button
window.toggleProviderOnlineStatus = function() {
    const btn = document.getElementById('pd-toggle-online-btn');
    const text = document.getElementById('pd-status-text');
    const dot = document.getElementById('pd-status-dot');

    if (!btn) return;

    if (btn.classList.contains('offline')) {
        btn.classList.remove('offline');
        text.textContent = 'Go Online';
        dot.style.background = '#22C55E'; // Green
        showPopup('You are now online and ready for jobs', 'success');
    } else {
        btn.classList.add('offline');
        text.textContent = 'Go Offline';
        dot.style.background = '#EF4444'; // Red
        showPopup('You are now offline', 'info');
    }
};

// Accept Job Request
window.handleAcceptJob = function(reqId, customerName, serviceType) {
    const item = document.getElementById(reqId);
    if (item) {
        item.style.transition = 'all 0.3s ease';
        item.style.opacity = '0';
        setTimeout(() => item.remove(), 300);
    }
    showPopup(`Accepted job for ${customerName} (${serviceType})!`, 'success');
};

// Decline Job Request
window.handleDeclineJob = function(reqId) {
    const item = document.getElementById(reqId);
    if (item) {
        item.style.transition = 'all 0.3s ease';
        item.style.opacity = '0';
        setTimeout(() => item.remove(), 300);
    }
    showPopup('Job request declined.', 'info');
};

// Provider Logout Handler
window.handleProviderLogout = function() {
    appState.isLoggedIn = false;
    appState.role = null;
    showPopup('Logged out successfully', 'success');
    navigateTo('home');
};



// 2. Update initProviderDashboard in script.js to properly render icons and name:
function initProviderDashboard() {
    const nameEl = document.getElementById('pd-provider-name');
    const welcomeEl = document.getElementById('pd-welcome-heading');
    
   const providerName = (appState.currentUser && appState.currentUser.name) ? appState.currentUser.name : 'Suman';

    if (nameEl) nameEl.textContent = providerName;
    if (welcomeEl) welcomeEl.textContent = `Welcome back ${providerName}`;

    setTimeout(() => {
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }, 50);
}

// Toggle Online / Offline Status Button
window.toggleProviderOnlineStatus = function() {
    const btn = document.getElementById('pd-toggle-online-btn');
    const text = document.getElementById('pd-status-text');
    const dot = document.getElementById('pd-status-dot');

    if (!btn) return;

    if (btn.classList.contains('offline')) {
        btn.classList.remove('offline');
        text.textContent = 'Go Online';
        dot.style.background = '#22C55E';
        showPopup('You are now online and ready for jobs', 'success');
    } else {
        btn.classList.add('offline');
        text.textContent = 'Go Offline';
        dot.style.background = '#EF4444';
        showPopup('You are now offline', 'info');
    }
};

window.handleAcceptJob = function(reqId, customerName, serviceType) {
    const item = document.getElementById(reqId);
    if (item) {
        item.style.transition = 'all 0.3s ease';
        item.style.opacity = '0';
        setTimeout(() => item.remove(), 300);
    }
    showPopup(`Accepted job for ${customerName} (${serviceType})!`, 'success');
};

window.handleDeclineJob = function(reqId) {
    const item = document.getElementById(reqId);
    if (item) {
        item.style.transition = 'all 0.3s ease';
        item.style.opacity = '0';
        setTimeout(() => item.remove(), 300);
    }
    showPopup('Job request declined.', 'info');
};

window.handleProviderLogout = function() {
    appState.isLoggedIn = false;
    appState.role = null;
    showPopup('Logged out successfully', 'success');
    navigateTo('home');
};





// ==========================================================================
// MOBILE NAV PANEL (hamburger menu)
// Add this whole block to script.js — anywhere after appState is defined.
// Call site: the hamburger buttons in index.html already call openMobileNav('public'|'customer'|'provider')
// ==========================================================================

const mobileNavContent = {
    public: {
        links: [
            { label: 'Home', route: 'home' },
            { label: 'Services', route: 'services' },
            { label: 'How it Works', route: 'howItWorks' },
            { label: 'Become Provider', route: 'becomeProvider' }
        ],
        actionsHtml: `
            <a href="#" class="btn btn-outline" onclick="closeMobileNav(); navigateTo('login'); return false;">Login</a>
            <a href="#" class="btn btn-primary" onclick="closeMobileNav(); navigateTo('login', {openSignup: true}); return false;">Get Started</a>
        `
    },
    customer: {
        links: [
            { label: 'Home', route: 'dashboard' },
            { label: 'Services', route: 'services' },
            { label: 'Find Provider', route: 'findProvider' }
        ],
        actionsHtml: `
            <a href="#" class="btn btn-outline" onclick="closeMobileNav(); handleTrackServiceClick(); return false;">Track Service</a>
            <a href="#" class="btn btn-outline" style="color:#BA1A1A;" onclick="closeMobileNav(); handleCustomerLogout(); return false;">Logout</a>
        `
    },
    provider: {
        links: [
            { label: 'Home', route: 'providerProfile' },
            { label: 'Dashboard', route: 'providerDashboard' }
        ],
        actionsHtml: `
            <a href="#" class="btn btn-outline" style="color:#BA1A1A;" onclick="closeMobileNav(); appState.isLoggedIn=false; appState.role=null; navigateTo('home'); showPopup('Logged out successfully', 'success'); return false;">Logout</a>
        `
    }
};

window.openMobileNav = function(variant) {
    const content = mobileNavContent[variant] || mobileNavContent.public;
    const linksList = document.getElementById('mobile-nav-links');
    const actionsBox = document.getElementById('mobile-nav-actions');

    linksList.innerHTML = content.links.map(link =>
        `<li><a href="#" onclick="closeMobileNav(); navigateTo('${link.route}'); return false;">${link.label}</a></li>`
    ).join('');

    actionsBox.innerHTML = content.actionsHtml;

    document.getElementById('mobile-nav-panel').classList.add('open');
    document.getElementById('mobile-nav-backdrop').classList.add('open');
    document.body.style.overflow = 'hidden'; // lock background scroll while panel is open
};

window.closeMobileNav = function() {
    document.getElementById('mobile-nav-panel').classList.remove('open');
    document.getElementById('mobile-nav-backdrop').classList.remove('open');
    document.body.style.overflow = '';
};