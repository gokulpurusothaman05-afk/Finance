/**
 * STACKLY - ADMIN & ADVISOR DASHBOARD ENGINE
 * Platform-wide AUM analytics, Live KYC Approval workflow, SEBI Compliance logs, Dynamic Admin Session
 */

document.addEventListener('DOMContentLoaded', () => {
  initAdminSession();
  initAdminSidebarNav();
  initMobileSidebar();
  initAdminAumChart();
  initKycActions();
  initClientSearch();
  initBroadcastModal();
  initReportExport();
});

/* ==========================================================================
   1. ADMIN SESSION HYDRATION
   ========================================================================== */
function initAdminSession() {
  const session = window.getStacklySession ? window.getStacklySession() : (JSON.parse(sessionStorage.getItem('stackly_session') || '{}'));

  if (session && session.userName) {
    const titleEl = document.getElementById('admin-topbar-title');
    const nameEl = document.getElementById('admin-display-name');
    const initialsEl = document.getElementById('admin-avatar-initials');
    const idEl = document.getElementById('admin-display-id');

    if (titleEl) titleEl.textContent = `Admin Terminal • ${session.userName}`;
    if (nameEl) nameEl.textContent = session.userName;
    if (initialsEl && session.userInitials) initialsEl.textContent = session.userInitials;
    if (idEl && session.clientId) idEl.textContent = `Principal Officer • ${session.clientId}`;
  }
}

/* ==========================================================================
   2. SIDEBAR NAVIGATION & SECTION SCROLLING
   ========================================================================== */
function initAdminSidebarNav() {
  const navItems = document.querySelectorAll('.dash-nav-menu a[href^="#"]');
  const sections = document.querySelectorAll('.dash-panel, .dash-table-panel');
  const sidebar = document.querySelector('.dash-sidebar');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const targetId = item.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);

      if (targetSection) {
        e.preventDefault();

        // Update active classes
        navItems.forEach(nav => {
          nav.classList.remove('admin-active');
          nav.classList.remove('active');
        });
        item.classList.add('admin-active');

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

  // Highlight active section on scroll
  if ('IntersectionObserver' in window && sections.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.target.id) {
          navItems.forEach(nav => {
            if (nav.getAttribute('href') === `#${entry.target.id}`) {
              nav.classList.add('admin-active');
            } else if (nav.getAttribute('href').startsWith('#')) {
              nav.classList.remove('admin-active');
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
   4. PLATFORM AUM GROWTH & INFLOWS CANVAS CHART
   ========================================================================== */
function initAdminAumChart() {
  const canvas = document.getElementById('adminAumChartCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const aumPoints = [2100, 2480, 2900, 3450, 4120, 4580, 4850.40]; // in Crores

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
    drawChart();
  }

  function drawChart() {
    const parent = canvas.parentElement;
    const w = parent ? parent.clientWidth : 300;
    const h = parent ? parent.clientHeight : 220;
    if (w <= 0 || h <= 0) return;

    ctx.clearRect(0, 0, w, h);

    const paddingX = Math.min(32, Math.max(16, w * 0.07));
    const paddingY = 24;
    const graphW = Math.max(10, w - paddingX * 2);
    const graphH = Math.max(10, h - paddingY * 2);

    const min = 1800;
    const max = 5200;

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

    const coords = aumPoints.map((val, idx) => {
      const x = paddingX + (graphW / (aumPoints.length - 1)) * idx;
      const y = paddingY + graphH - ((val - min) / (max - min)) * graphH;
      return { x, y };
    });

    // Draw Gradient Area under curve
    const gradient = ctx.createLinearGradient(0, paddingY, 0, h - paddingY);
    gradient.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
    gradient.addColorStop(1, 'rgba(245, 158, 11, 0.0)');

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

    // Draw Gold Curve
    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    for (let i = 0; i < coords.length - 1; i++) {
      const xc = (coords[i].x + coords[i + 1].x) / 2;
      const yc = (coords[i].y + coords[i + 1].y) / 2;
      ctx.quadraticCurveTo(coords[i].x, coords[i].y, xc, yc);
    }
    ctx.lineTo(coords[coords.length - 1].x, coords[coords.length - 1].y);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw Data Nodes
    coords.forEach((pt, idx) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, idx === coords.length - 1 ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = idx === coords.length - 1 ? '#ffffff' : '#f59e0b';
      ctx.fill();
      ctx.strokeStyle = '#07090e';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }

  window.addEventListener('resize', resizeCanvas);
  setTimeout(resizeCanvas, 80);
}

/* ==========================================================================
   5. KYC APPROVAL & REJECTION WORKFLOW
   ========================================================================== */
function initKycActions() {
  const pendingCountBadge = document.getElementById('pending-kyc-count');
  let count = pendingCountBadge ? parseInt(pendingCountBadge.textContent) || 48 : 48;

  document.addEventListener('click', (e) => {
    // Approve Action
    if (e.target.matches('.btn-approve-kyc') || e.target.closest('.btn-approve-kyc')) {
      const btn = e.target.matches('.btn-approve-kyc') ? e.target : e.target.closest('.btn-approve-kyc');
      const row = btn.closest('tr');
      const clientName = row.querySelector('.kyc-client-name').textContent;
      const statusCell = row.querySelector('.kyc-status-cell');
      const actionCell = row.querySelector('.kyc-action-cell');

      statusCell.innerHTML = '<span class="status-pill status-active">Approved</span>';
      actionCell.innerHTML = '<span style="font-size: 0.75rem; color: var(--text-muted);">Verified (SEBI CAMS)</span>';

      count = Math.max(0, count - 1);
      if (pendingCountBadge) pendingCountBadge.textContent = count;

      if (window.showToast) {
        window.showToast(`KYC Approved for ${clientName}. Demat & Trading account activated.`);
      }
    }

    // Reject Action
    if (e.target.matches('.btn-reject-kyc') || e.target.closest('.btn-reject-kyc')) {
      const btn = e.target.matches('.btn-reject-kyc') ? e.target : e.target.closest('.btn-reject-kyc');
      const row = btn.closest('tr');
      const clientName = row.querySelector('.kyc-client-name').textContent;
      const statusCell = row.querySelector('.kyc-status-cell');
      const actionCell = row.querySelector('.kyc-action-cell');

      statusCell.innerHTML = '<span class="status-pill status-rejected">Docs Rejected</span>';
      actionCell.innerHTML = '<span style="font-size: 0.75rem; color: var(--accent-danger);">Re-upload requested</span>';

      count = Math.max(0, count - 1);
      if (pendingCountBadge) pendingCountBadge.textContent = count;

      if (window.showToast) {
        window.showToast(`KYC Rejected for ${clientName}. Re-submission SMS & Email dispatched.`, 'error');
      }
    }
  });
}

/* ==========================================================================
   6. CLIENT SEARCH FILTER
   ========================================================================== */
function initClientSearch() {
  const searchInput = document.getElementById('admin-client-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('.admin-clients-body tr');

    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(term) ? '' : 'none';
    });
  });
}

/* ==========================================================================
   7. BROADCAST MARKET ALERT MODAL
   ========================================================================== */
function initBroadcastModal() {
  const openBtns = document.querySelectorAll('.btn-open-broadcast');
  const modalBackdrop = document.getElementById('broadcast-modal');
  const closeBtn = document.getElementById('broadcast-close');
  const broadcastForm = document.getElementById('broadcast-form');

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

  if (broadcastForm) {
    broadcastForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('broadcast-title-input').value;
      const audience = document.getElementById('broadcast-audience-select').value;

      modalBackdrop.classList.remove('is-active');

      if (window.showToast) {
        window.showToast(`Broadcast Sent! "${title}" pushed to ${audience}. Redirecting...`);
      }

      setTimeout(() => {
        window.location.href = '404.html';
      }, 700);
    });
  }
}

/* ==========================================================================
   8. EXPORT SEBI REGULATORY AUDIT REPORT
   ========================================================================== */
function initReportExport() {
  const exportBtns = document.querySelectorAll('.btn-export-report');
  exportBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.showToast) {
        window.showToast('Generating SEBI Master Audit Trail (FY 2026-27)...');
      }

      setTimeout(() => {
        const csvContent = "data:text/csv;charset=utf-8,TransactionID,ClientID,PAN,Asset,Type,Amount_INR,Status,SEBI_Timestamp\n"
          + "TXN98421,STK-IN-894210,ABCDE1234F,NIFTY50 ETF,BUY,250000,SETTLED,2026-10-08 10:14:22\n"
          + "TXN98422,STK-IN-774120,XYZPK9912A,RELIANCE EQ,BUY,500000,SETTLED,2026-10-08 10:15:05\n"
          + "TXN98423,STK-IN-109284,BGMPO8821C,SGB 2026-I,BUY,120000,SETTLED,2026-10-08 10:16:49\n";

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "STACKLY_SEBI_AUDIT_REPORT_OCT_2026.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (window.showToast) {
          window.showToast('Audit Report downloaded successfully!');
        }
      }, 1000);
    });
  });
}
