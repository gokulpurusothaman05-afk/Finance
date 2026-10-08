/**
 * STACKLY - PRIMARY FRONTEND JAVASCRIPT
 * Domain: Wealth Management & Fintech (Indian Financial Ecosystem)
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileNav();
  initMarketTicker();
  initSipCalculator();
  initTestimonialSlider();
  initFaqAccordion();
  initFormHandlers();
  initPricingToggle();
});

/* ==========================================================================
   1. STICKY HEADER WITH BACKDROP BLUR
   ========================================================================== */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ==========================================================================
   2. MOBILE NAVIGATION DRAWER TOGGLE
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navDrawer = document.querySelector('.mobile-nav-drawer');

  if (!toggleBtn || !navDrawer) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = toggleBtn.classList.toggle('is-open');
    navDrawer.classList.toggle('is-open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close when clicking any nav link
  const mobileLinks = navDrawer.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggleBtn.classList.remove('is-open');
      navDrawer.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });
}

/* ==========================================================================
   3. INDIAN MARKET LIVE TICKER SIMULATION
   ========================================================================== */
function initMarketTicker() {
  const tickerContainer = document.querySelector('.ticker-track');
  if (!tickerContainer) return;

  const indices = [
    { name: 'NIFTY 50', base: 25480.25, chg: 0.65 },
    { name: 'SENSEX', base: 83210.40, chg: 0.58 },
    { name: 'BANK NIFTY', base: 54120.10, chg: 0.82 },
    { name: 'NIFTY MIDCAP 100', base: 59340.75, chg: 1.15 },
    { name: 'NIFTY SMALLCAP 250', base: 18240.30, chg: 1.42 },
    { name: 'GOLD 24K (10g)', base: 76450.00, chg: 0.35 },
    { name: 'SILVER 1KG', base: 92100.00, chg: -0.22 },
    { name: 'USD / INR', base: 83.92, chg: -0.05 },
    { name: 'INDIA 10Y G-SEC', base: 6.84, chg: -0.02, isYield: true }
  ];

  function renderTicker() {
    let html = '';
    // Duplicate 2x for infinite smooth loop
    for (let i = 0; i < 2; i++) {
      indices.forEach(item => {
        const isPos = item.chg >= 0;
        const sign = isPos ? '+' : '';
        const chgClass = isPos ? 'ticker-up' : 'ticker-down';
        const formattedVal = item.isYield 
          ? `${item.base.toFixed(2)}%` 
          : item.name.includes('USD') 
            ? `₹${item.base.toFixed(2)}` 
            : `₹${item.base.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

        html += `
          <div class="ticker-item">
            <span class="ticker-name">${item.name}:</span>
            <span class="ticker-val">${formattedVal}</span>
            <span class="ticker-chg ${chgClass}">${sign}${item.chg.toFixed(2)}%</span>
          </div>
        `;
      });
    }
    tickerContainer.innerHTML = html;
  }

  renderTicker();

  // Subtle real-time tick fluctuation every 3.5 seconds
  setInterval(() => {
    const randomIndex = Math.floor(Math.random() * indices.length);
    const delta = (Math.random() - 0.48) * 0.15;
    indices[randomIndex].chg = parseFloat((indices[randomIndex].chg + delta).toFixed(2));
    if (!indices[randomIndex].isYield) {
      indices[randomIndex].base = parseFloat((indices[randomIndex].base * (1 + delta / 100)).toFixed(2));
    }
    renderTicker();
  }, 3500);
}

/* ==========================================================================
   4. INTERACTIVE SIP & COMPOUND WEALTH CALCULATOR (Indian Rupee Lakhs/Crores)
   ========================================================================== */
function initSipCalculator() {
  const monthlySlider = document.getElementById('sip-monthly-slider');
  const returnSlider = document.getElementById('sip-return-slider');
  const yearsSlider = document.getElementById('sip-years-slider');

  if (!monthlySlider || !returnSlider || !yearsSlider) return;

  const monthlyDisplay = document.getElementById('sip-monthly-val');
  const returnDisplay = document.getElementById('sip-return-val');
  const yearsDisplay = document.getElementById('sip-years-val');

  const totalWealthDisplay = document.getElementById('sip-total-wealth');
  const totalInvestedDisplay = document.getElementById('sip-total-invested');
  const estReturnsDisplay = document.getElementById('sip-est-returns');
  const barInvested = document.getElementById('calc-bar-invested');
  const barReturns = document.getElementById('calc-bar-returns');

  function formatIndianCurrency(num) {
    if (num >= 10000000) {
      return `₹ ${(num / 10000000).toFixed(2)} Cr`;
    } else if (num >= 100000) {
      return `₹ ${(num / 100000).toFixed(2)} L`;
    } else {
      return `₹ ${Math.round(num).toLocaleString('en-IN')}`;
    }
  }

  function calculateSip() {
    const P = parseFloat(monthlySlider.value);
    const annualRate = parseFloat(returnSlider.value);
    const years = parseFloat(yearsSlider.value);

    // Monthly interest rate
    const i = (annualRate / 100) / 12;
    // Total months
    const n = years * 12;

    // SIP Future Value formula: M = P * [((1 + i)^n - 1) / i] * (1 + i)
    const futureValue = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const totalInvested = P * n;
    const estReturns = futureValue - totalInvested;

    // Update UI displays
    if (monthlyDisplay) monthlyDisplay.textContent = `₹ ${P.toLocaleString('en-IN')}`;
    if (returnDisplay) returnDisplay.textContent = `${annualRate}% p.a.`;
    if (yearsDisplay) yearsDisplay.textContent = `${years} Yr${years > 1 ? 's' : ''}`;

    if (totalWealthDisplay) totalWealthDisplay.textContent = formatIndianCurrency(futureValue);
    if (totalInvestedDisplay) totalInvestedDisplay.textContent = formatIndianCurrency(totalInvested);
    if (estReturnsDisplay) estReturnsDisplay.textContent = formatIndianCurrency(estReturns);

    // Update visual ratio bar
    if (barInvested && barReturns) {
      const investedPercent = Math.max(5, Math.min(95, (totalInvested / futureValue) * 100));
      const returnsPercent = 100 - investedPercent;
      barInvested.style.width = `${investedPercent}%`;
      barReturns.style.width = `${returnsPercent}%`;
    }
  }

  monthlySlider.addEventListener('input', calculateSip);
  returnSlider.addEventListener('input', calculateSip);
  yearsSlider.addEventListener('input', calculateSip);

  calculateSip();
}

/* ==========================================================================
   5. TESTIMONIALS CAROUSEL SLIDER (Exact Vanguard Mechanics)
   ========================================================================== */
function initTestimonialSlider() {
  const tracks = document.querySelectorAll('.testimonial-track');
  if (tracks.length === 0) return;

  tracks.forEach(track => {
    const wrapper = track.closest('.testimonial-wrapper') || track.parentElement;
    const cells = track.querySelectorAll('.testimonial-cell, .testimonial-slide');
    if (cells.length === 0) return;

    const prevBtn = wrapper.querySelector('.carousel-prev') || wrapper.querySelector('.slider-arrow-btn:first-child');
    const nextBtn = wrapper.querySelector('.carousel-next') || wrapper.querySelector('.slider-arrow-btn:last-child');

    let currentIndex = 0;
    let autoSlideTimer = null;

    function getVisibleCount() {
      if (window.innerWidth <= 767) return 1;
      if (window.innerWidth <= 991) return 2;
      return 3;
    }

    function getMaxIndex() {
      return Math.max(0, cells.length - getVisibleCount());
    }

    function updateSlider() {
      const maxIndex = getMaxIndex();
      if (currentIndex > maxIndex) currentIndex = maxIndex;
      if (currentIndex < 0) currentIndex = 0;

      const firstCell = cells[0];
      const cellWidth = firstCell.getBoundingClientRect().width;
      const gap = 24;
      const offset = currentIndex * (cellWidth + gap);
      track.style.transform = `translateX(-${offset}px)`;
    }

    function nextSlide() {
      const maxIndex = getMaxIndex();
      if (currentIndex < maxIndex) {
        currentIndex++;
      } else {
        currentIndex = 0;
      }
      updateSlider();
    }

    function prevSlide() {
      const maxIndex = getMaxIndex();
      if (currentIndex > 0) {
        currentIndex--;
      } else {
        currentIndex = maxIndex;
      }
      updateSlider();
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        prevSlide();
        startAuto();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        nextSlide();
        startAuto();
      });
    }

    function startAuto() {
      stopAuto();
      autoSlideTimer = setInterval(nextSlide, 5000);
    }

    function stopAuto() {
      if (autoSlideTimer) clearInterval(autoSlideTimer);
    }

    wrapper.addEventListener('mouseenter', stopAuto);
    wrapper.addEventListener('mouseleave', startAuto);
    window.addEventListener('resize', updateSlider);

    updateSlider();
    startAuto();
  });
}

/* ==========================================================================
   6. FAQ ACCORDION (Plus & Close Toggle)
   ========================================================================== */
function initFaqAccordion() {
  const cells = document.querySelectorAll('.accordian-cell, .accordion-item');
  if (cells.length === 0) return;

  cells.forEach(cell => {
    const bar = cell.querySelector('.accordian-bar, .accordion-header') || cell;
    const content = cell.querySelector('.accordion-content, .accordion-body');
    if (!content) return;

    // Initialize pre-opened state
    if (cell.classList.contains('is-open')) {
      content.style.maxHeight = content.scrollHeight + 32 + 'px';
    } else {
      content.style.maxHeight = null;
    }

    bar.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = cell.classList.contains('is-open');

      // Close all other accordions
      cells.forEach(other => {
        other.classList.remove('is-open');
        const otherContent = other.querySelector('.accordion-content, .accordion-body');
        if (otherContent) otherContent.style.maxHeight = null;
      });

      // Toggle current accordion
      if (!isOpen) {
        cell.classList.add('is-open');
        content.style.maxHeight = content.scrollHeight + 32 + 'px';
      }
    });
  });
}

/* ==========================================================================
   7. PRICING MONTHLY / ANNUAL BILLING TOGGLE
   ========================================================================== */
function initPricingToggle() {
  const monthlyBtn = document.getElementById('pricing-monthly-btn');
  const annualBtn = document.getElementById('pricing-annual-btn');
  if (!monthlyBtn || !annualBtn) return;

  const proPrice = document.getElementById('pricing-pro-val');
  const periodTags = document.querySelectorAll('.pricing-period');

  monthlyBtn.addEventListener('click', () => {
    monthlyBtn.classList.add('active');
    annualBtn.classList.remove('active');
    if (proPrice) proPrice.textContent = '₹799';
    periodTags.forEach(tag => tag.textContent = '/ month');
  });

  annualBtn.addEventListener('click', () => {
    annualBtn.classList.add('active');
    monthlyBtn.classList.remove('active');
    if (proPrice) proPrice.textContent = '₹649';
    periodTags.forEach(tag => tag.textContent = '/ mo (billed annually)');
  });
}

/* ==========================================================================
   8. FORM HANDLERS (Redirect all forms except login to 404)
   ========================================================================== */
function initFormHandlers() {
  // Intercept all forms across the site EXCEPT the login form
  const forms = document.querySelectorAll('form:not(#stackly-login-form)');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Submit';
      
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Submitting & Routing...';
      }

      showToast('Form submission received! Redirecting to confirmation...');

      setTimeout(() => {
        window.location.href = '404.html';
      }, 700);
    });
  });
}

function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Intercept all call/tel links to prevent browser call alerts and redirect directly to 404.html
document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (link && link.getAttribute('href')) {
    const href = link.getAttribute('href');
    if (href.startsWith('tel:') || href.startsWith('mailto:')) {
      e.preventDefault();
      window.location.href = '404.html';
    }
  }
});

// Export toast globally
window.showToast = showToast;

