// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            
            // Change icon when menu is open
            const icon = mobileMenuButton.querySelector('svg');
            if (mobileMenu.classList.contains('hidden')) {
                icon.innerHTML = `
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 6h16M4 12h16M4 18h16" />
                `;
            } else {
                icon.innerHTML = `
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M6 18L18 6M6 6l12 12" />
                `;
            }
        });
    }

    // Theme toggle functionality
    const themeToggle = document.querySelector('[data-theme-toggle]');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }

    // Initialize theme based on localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.classList.add('dark');
    }

    // Auction timer countdown
    initializeCountdownTimers();

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Handle form submissions
    const forms = document.querySelectorAll('form[data-ajax]');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmission(form);
        });
    });
});

// Initialize countdown timers for auctions
function initializeCountdownTimers() {
    const timerElements = document.querySelectorAll('.auction-timer');
    
    timerElements.forEach(timerElement => {
        const endTime = new Date(timerElement.dataset.endTime).getTime();
        
        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = endTime - now;

            if (distance < 0) {
                clearInterval(timerInterval);
                timerElement.innerHTML = '<span class="text-error font-bold">EXPIRED</span>';
                return;
            }

            const hours = Math.floor(distance / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            timerElement.innerHTML = `${hours}j ${minutes}m ${seconds}s`;
        };

        updateTimer(); // Initial call
        const timerInterval = setInterval(updateTimer, 1000);
    });
}

// Handle form submission with AJAX
function handleFormSubmission(form) {
    const formData = new FormData(form);
    const action = form.getAttribute('action');
    const method = form.getAttribute('method') || 'POST';

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
    if (submitBtn) {
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="flex items-center"><svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processing...</span>';
        submitBtn.disabled = true;
    }

    fetch(action, {
        method: method,
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        }
    })
    .then(response => response.json())
    .then(data => {
        // Reset button state
        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }

        // Handle response
        if (data.success) {
            showMessage('Success!', data.message || 'Operation completed successfully.', 'success');
            if (data.redirect) {
                setTimeout(() => {
                    window.location.href = data.redirect;
                }, 1500);
            }
        } else {
            showMessage('Error!', data.message || 'An error occurred.', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        
        // Reset button state
        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
        
        showMessage('Error!', 'An unexpected error occurred. Please try again.', 'error');
    });
}

// Show message toast
function showMessage(title, message, type = 'info') {
    // Remove any existing toasts
    const existingToast = document.getElementById('toast-message');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.id = 'toast-message';
    toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${
        type === 'success' ? 'bg-green-100 border border-green-200 text-green-800' :
        type === 'error' ? 'bg-red-100 border border-red-200 text-red-800' :
        'bg-blue-100 border border-blue-200 text-blue-800'
    }`;

    toast.innerHTML = `
        <div class="flex items-start">
            <div class="flex-shrink-0">
                ${type === 'success' ? 
                    '<svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>' :
                  type === 'error' ? 
                    '<svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>' :
                  '<svg class="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>'
                }
            </div>
            <div class="ml-3 flex-1">
                <h3 class="text-sm font-medium">${title}</h3>
                <div class="mt-1 text-sm">${message}</div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 flex-shrink-0 text-gray-500 hover:text-gray-700">
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>
    `;

    document.body.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 5000);
}

// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Function to handle bid submission
function submitBid(auctionId, amount) {
    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('_token', document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '');

    fetch(`/auctions/${auctionId}/bid`, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage('Bid Placed!', `Your bid of ${formatCurrency(amount)} was successful!`, 'success');
            // Update bid count and current price on the page
            document.querySelector(`.auction-${auctionId} .bid-count`).textContent = data.bid_count;
            document.querySelector(`.auction-${auctionId} .current-price`).textContent = formatCurrency(data.current_price);
        } else {
            showMessage('Bid Failed!', data.message || 'Unable to place bid.', 'error');
        }
    })
    .catch(error => {
        console.error('Error placing bid:', error);
        showMessage('Error!', 'An unexpected error occurred. Please try again.', 'error');
    });
}

// Function to handle auction favorites
function toggleFavorite(auctionId) {
    const formData = new FormData();
    formData.append('_token', document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '');

    fetch(`/auctions/${auctionId}/favorite`, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const heartIcon = document.querySelector(`.favorite-btn-${auctionId} svg`);
            if (data.is_favorite) {
                heartIcon.classList.remove('text-gray-400');
                heartIcon.classList.add('text-red-500', 'fill-current');
            } else {
                heartIcon.classList.remove('text-red-500', 'fill-current');
                heartIcon.classList.add('text-gray-400');
            }
        }
    })
    .catch(error => {
        console.error('Error toggling favorite:', error);
        showMessage('Error!', 'Unable to update favorite status.', 'error');
    });
}

// Debounced search function for auction listings
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize search functionality
function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        const debouncedSearch = debounce(function() {
            const query = searchInput.value.trim();
            // Perform search - could be AJAX or client-side filtering
            performSearch(query);
        }, 300);

        searchInput.addEventListener('input', debouncedSearch);
    }
}

// Perform search (placeholder function)
function performSearch(query) {
    console.log('Searching for:', query);
    // Actual search implementation would go here
}

// Initialize all interactive elements when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initSearch();
});
