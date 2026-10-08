/**
 * STACKLY - CLIENT DASHBOARD INTERACTIVE ENGINE
 * Real-time Indian portfolio metrics, Canvas Chart, Live Watchlist, SIP Controls, Dynamic User Session
 */

document.addEventListener('DOMContentLoaded', () => {
  initUserSession();
  initSidebarNavigation();
  initMobileSidebar();
  initClientChart();
  initLiveWatchlist();
  initSipActions();
  initTransactionFilter();
  initQuickInvestModal();
});

/* ==========================================================================
   1. USER SESSION HYDRATION
   ========================================================================== */
function initUserSession() {
  const session = window.getStacklySession ? window.getStacklySession() : (JSON.parse(sessionStorage.getItem('stackly_session') || '{}'));
  
  if (session && session.userName) {
    const greetingEl = document.getElementById('dash-topbar-greeting');
    const nameEl = document.getElementById('dash-display-name');
    const initialsEl = document.getElementById('dash-avatar-initials');
    const idEl = document.getElementById('dash-display-id');

    if (greetingEl) greetingEl.textContent = `Welcome back, ${session.userName}`;
    if (nameEl) nameEl.textContent = session.userName;
    if (initialsEl && session.userInitials) initialsEl.textContent = session.userInitials;
    if (idEl && session.clientId) idEl.textContent = session.clientId;
  }
}

/* ==========================================================================
   2. SIDEBAR NAVIGATION & SECTION SCROLLING
   ========================================================================== */
function initSidebarNavigation() {
  const navItems = document.querySelectorAll('.dash-nav-menu a[href^="#"]');
  const sections = document.querySelectorAll('.dash-section, .dash-table-panel, .dash-panel');
  const sidebar = document.querySelector('.dash-sidebar');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const targetId = item.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        e.preventDefault();
        
        // Update active class
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        // Precise vertical scroll with zero horizontal shift
        const topbarHeight = 75;
        const elementPosition = targetSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - topbarHeight;

        window.scrollTo({
          top: Math.max(0, offsetPosition),
          left: 0,
          behavior: 'smooth'
        });

        // Close mobile sidebar if open
        if (sidebar && sidebar.classList.contains('is-open')) {
          sidebar.classList.remove('is-open');
        }
      }
    });
  });

  // IntersectionObserver to highlight current active section on scroll
  if ('IntersectionObserver' in window && sections.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.id) {
          navItems.forEach(nav => {
            if (nav.getAttribute('href') === `#${entry.target.id}`) {
              nav.classList.add('active');
            } else if (nav.getAttribute('href').startsWith('#')) {
              nav.classList.remove('active');
            }
          });
        }
      });
    }, {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    });

    sections.forEach(sec => {
      if (sec.id) observer.observe(sec);
    });
  }
}

/* ==========================================================================
   3. MOBILE SIDEBAR TOGGLE
   ========================================================================== */
function initMobileSidebar() {
  const toggleBtn = document.querySelector('.dash-mobile-menu-btn');
  const sidebar = document.querySelector('.dash-sidebar');

  if (!toggleBtn || !sidebar) return;

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sidebar.classList.toggle('is-open');
  });

  document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
      sidebar.classList.remove('is-open');
    }
  });
}

/* ==========================================================================
   4. CLIENT PORTFOLIO PERFORMANCE CANVAS CHART
   ========================================================================== */
function initClientChart() {
  const canvas = document.getElementById('portfolioChartCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const timeBtns = document.querySelectorAll('.chart-time-btn');

  const chartDataSets = {
    '1M': [3850000, 3910000, 3880000, 3990000, 4050000, 4120000, 4285600],
    '3M': [3540000, 3620000, 3750000, 3820000, 3990000, 4110000, 4285600],
    '6M': [3200000, 3350000, 3510000, 3780000, 3920000, 4100000, 4285600],
    '1Y': [2850000, 3050000, 3280000, 3490000, 3800000, 4050000, 4285600],
    '3Y': [1850000, 2200000, 2650000, 3100000, 3550000, 3950000, 4285600],
    'ALL': [1200000, 1650000, 2150000, 2750000, 3400000, 3900000, 4285600]
  };

  let activeTimeframe = '1Y';

  function resizeCanvas() {
    const parent = canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (w <= 0 || h <= 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0); // Always reset transform first to prevent cumulative scaling
    ctx.scale(dpr, dpr);
    drawChart(chartDataSets[activeTimeframe]);
  }

  function drawChart(points) {
    const parent = canvas.parentElement;
    const w = parent ? parent.clientWidth : 300;
    const h = parent ? parent.clientHeight : 220;
    if (w <= 0 || h <= 0) return;

    ctx.clearRect(0, 0, w, h);

    const paddingX = Math.min(32, Math.max(16, w * 0.07));
    const paddingY = 24;
    const graphW = Math.max(10, w - paddingX * 2);
    const graphH = Math.max(10, h - paddingY * 2);

    const min = Math.min(...points) * 0.95;
    const max = Math.max(...points) * 1.05;

    // Draw horizontal grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const y = paddingY + (graphH / 3) * i;
      ctx.beginPath();
      ctx.moveTo(paddingX, y);
      ctx.lineTo(w - paddingX, y);
      ctx.stroke();
    }

    // Calculate coordinate points
    const coords = points.map((val, idx) => {
      const x = paddingX + (graphW / (points.length - 1)) * idx;
      const y = paddingY + graphH - ((val - min) / (max - min)) * graphH;
      return { x, y };
    });

    // Draw Gradient Area under curve
    const gradient = ctx.createLinearGradient(0, paddingY, 0, h - paddingY);
    gradient.addColorStop(0, 'rgba(0, 208, 132, 0.35)');
    gradient.addColorStop(1, 'rgba(0, 208, 132, 0.0)');

    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    for (let i = 0; i < coords.length - 1; i++) {
      const xc = (coords[i].x + coords[i + 1].x) / 2;
      const yc = (coords[i].y + coords[i + 1].y) / 2;
      ctx.quadraticCurveTo(coords[i].x, coords[i].y, xc, yc);
    }
    ctx.lineTo(coords[coords.length - 1].x, coords[coords.length - 1].y);
    ctx.lineTo(coords[coords.length - 1].x, h - paddingY);
    ctx.lineTo(coords[0].x, h - paddingY);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw Smooth Line Curve
    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    for (let i = 0; i < coords.length - 1; i++) {
      const xc = (coords[i].x + coords[i + 1].x) / 2;
      const yc = (coords[i].y + coords[i + 1].y) / 2;
      ctx.quadraticCurveTo(coords[i].x, coords[i].y, xc, yc);
    }
    ctx.lineTo(coords[coords.length - 1].x, coords[coords.length - 1].y);
    ctx.strokeStyle = '#00d084';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw Data Point Dots
    coords.forEach((pt, idx) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, idx === coords.length - 1 ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = idx === coords.length - 1 ? '#ffffff' : '#00d084';
      ctx.fill();
      ctx.strokeStyle = '#07090e';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }

  timeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      timeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTimeframe = btn.getAttribute('data-time') || '1Y';
      drawChart(chartDataSets[activeTimeframe]);
    });
  });

  window.addEventListener('resize', resizeCanvas);
  setTimeout(resizeCanvas, 80);
}

/* ==========================================================================
   5. REAL-TIME LIVE INDIAN STOCK WATCHLIST
   ========================================================================== */
function initLiveWatchlist() {
  const stocks = [
    { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2984.50, change: 1.45 },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1682.10, change: 0.85 },
    { symbol: 'TCS', name: 'Tata Consultancy Services', price: 4290.00, change: -0.40 },
    { symbol: 'INFY', name: 'Infosys Limited', price: 1915.25, change: 2.10 },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 1245.80, change: 0.95 },
    { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', price: 158.40, change: -1.15 }
  ];

  const watchlistContainer = document.getElementById('dash-watchlist-grid');
  if (!watchlistContainer) return;

  function renderWatchlist() {
    watchlistContainer.innerHTML = stocks.map(stock => {
      const isUp = stock.change >= 0;
      const chgClass = isUp ? 'badge-up' : 'badge-down';
      const sign = isUp ? '+' : '';
      return `
        <div class="watchlist-card">
          <div class="watchlist-ticker-row">
            <span class="watchlist-symbol">${stock.symbol}</span>
            <span class="dash-stat-badge ${chgClass}">${sign}${stock.change.toFixed(2)}%</span>
          </div>
          <div class="watchlist-price-row">
            <span class="watchlist-sector">${stock.name}</span>
            <span class="watchlist-price">₹ ${stock.price.toFixed(2)}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  renderWatchlist();

  // Fluctuate prices randomly every 3 seconds
  setInterval(() => {
    const idx = Math.floor(Math.random() * stocks.length);
    const delta = (Math.random() - 0.49) * 0.8;
    stocks[idx].change = parseFloat((stocks[idx].change + delta * 0.1).toFixed(2));
    stocks[idx].price = parseFloat((stocks[idx].price * (1 + delta / 1000)).toFixed(2));
    renderWatchlist();
  }, 3000);
}

/* ==========================================================================
   6. ACTIVE SIP CONTROLS (Pause, Resume, Cancel)
   ========================================================================== */
function initSipActions() {
  document.addEventListener('click', (e) => {
    if (e.target.matches('.btn-sip-toggle') || e.target.closest('.btn-sip-toggle')) {
      const btn = e.target.matches('.btn-sip-toggle') ? e.target : e.target.closest('.btn-sip-toggle');
      const row = btn.closest('tr');
      const statusPill = row.querySelector('.status-pill');
      const fundName = row.querySelector('.sip-fund-name').textContent;

      if (statusPill.classList.contains('status-active')) {
        statusPill.className = 'status-pill status-pending';
        statusPill.textContent = 'Paused';
        btn.textContent = 'Resume';
        if (window.showToast) window.showToast(`SIP for "${fundName}" paused. Next installment skipped.`);
      } else {
        statusPill.className = 'status-pill status-active';
        statusPill.textContent = 'Active';
        btn.textContent = 'Pause';
        if (window.showToast) window.showToast(`SIP for "${fundName}" resumed successfully.`);
      }
    }
  });
}

/* ==========================================================================
   7. TRANSACTIONS SEARCH & FILTER
   ========================================================================== */
function initTransactionFilter() {
  const searchInput = document.getElementById('transaction-search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('.transaction-table-body tr');

    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(term) ? '' : 'none';
    });
  });
}

/* ==========================================================================
   8. QUICK INVEST MODAL
   ========================================================================== */
function initQuickInvestModal() {
  const openBtns = document.querySelectorAll('.btn-open-quick-invest');
  const modalBackdrop = document.getElementById('quick-invest-modal');
  const closeBtn = document.getElementById('quick-invest-close');
  const investForm = document.getElementById('quick-invest-form');

  if (!modalBackdrop) return;

  openBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modalBackdrop.classList.add('is-active');
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modalBackdrop.classList.remove('is-active');
    });
  }

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      modalBackdrop.classList.remove('is-active');
    }
  });

  if (investForm) {
    investForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const amount = document.getElementById('invest-amount-input').value;
      const asset = document.getElementById('invest-asset-select').value;
      const type = document.getElementById('invest-type-select').value;

      modalBackdrop.classList.remove('is-active');

      if (window.showToast) {
        window.showToast(`Order Placed! ₹${Number(amount).toLocaleString('en-IN')} into ${asset} (${type}). Redirecting...`);
      }

      setTimeout(() => {
        window.location.href = '404.html';
      }, 700);
    });
  }
}
