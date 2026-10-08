/**
 * STACKLY - AUTHENTICATION & ROLE-BASED ACCESS CONTROL
 * Client Portal vs Admin / Advisor Portal
 */

document.addEventListener('DOMContentLoaded', () => {
  initAuthRoleSwitcher();
  initLoginForm();
  initOtpVerification();
});

let currentRole = 'client'; // Default role

/* ==========================================================================
   1. ROLE SWITCHER (Client vs Admin)
   ========================================================================== */
function initAuthRoleSwitcher() {
  const clientTab = document.getElementById('tab-client-role');
  const adminTab = document.getElementById('tab-admin-role');
  const portalTitle = document.getElementById('auth-portal-title');
  const portalSubtitle = document.getElementById('auth-portal-subtitle');
  const identifierLabel = document.getElementById('auth-identifier-label');
  const identifierInput = document.getElementById('auth-identifier-input');
  const nameInput = document.getElementById('auth-name-input');

  if (!clientTab || !adminTab) return;

  function switchRole(role) {
    currentRole = role;
    if (role === 'client') {
      clientTab.classList.add('active');
      adminTab.classList.remove('active');
      if (portalTitle) portalTitle.textContent = 'Welcome back, Investor';
      if (portalSubtitle) portalSubtitle.textContent = 'Sign in to track your portfolios, SIPs, and wealth growth.';
      if (identifierLabel) identifierLabel.textContent = 'Mobile Number / PAN / Client ID *';
      if (identifierInput) identifierInput.placeholder = 'e.g. 9876543210 or ABCDE1234F';
      if (nameInput) nameInput.placeholder = 'e.g. Rahul Sharma';
    } else {
      adminTab.classList.add('active');
      clientTab.classList.remove('active');
      if (portalTitle) portalTitle.textContent = 'Admin Command Center';
      if (portalSubtitle) portalSubtitle.textContent = 'Institutional access for SEBI compliance officers and wealth architects.';
      if (identifierLabel) identifierLabel.textContent = 'Admin Staff ID / Official Email *';
      if (identifierInput) identifierInput.placeholder = 'e.g. admin@stackly.in or STK-ADM-042';
      if (nameInput) nameInput.placeholder = 'e.g. Vikram Malhotra';
    }
  }

  clientTab.addEventListener('click', () => switchRole('client'));
  adminTab.addEventListener('click', () => switchRole('admin'));

  // Check URL query param if present (?role=admin)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('role') === 'admin') {
    switchRole('admin');
  }
}

/* ==========================================================================
   2. LOGIN FORM SUBMISSION & AUTH REDIRECTION
   ========================================================================== */
function initLoginForm() {
  const loginForm = document.getElementById('stackly-login-form');
  if (!loginForm) return;

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('auth-name-input');
    const identifierInput = document.getElementById('auth-identifier-input');
    const passwordInput = document.getElementById('auth-password-input');
    const submitBtn = document.getElementById('auth-submit-btn');

    const enteredName = nameInput ? nameInput.value.trim() : '';
    const identifier = identifierInput ? identifierInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';

    if (!enteredName || !identifier || !password) {
      if (window.showToast) window.showToast('Please fill all required credentials to sign in.', 'error');
      return;
    }

    // Collect OTP
    const otpBoxes = document.querySelectorAll('.otp-box');
    let enteredOtp = '';
    otpBoxes.forEach(b => enteredOtp += b.value.trim());

    if (otpBoxes.length > 0 && enteredOtp.length < 6) {
      if (window.showToast) window.showToast('Please enter the 6-digit authentication OTP.', 'error');
      return;
    }

    // Calculate initials
    const nameParts = enteredName.split(' ').filter(Boolean);
    let initials = 'IN';
    if (nameParts.length >= 2) {
      initials = (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    } else if (nameParts.length === 1 && nameParts[0].length > 0) {
      initials = nameParts[0].slice(0, 2).toUpperCase();
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline-block; vertical-align:middle; margin-right:6px; animation: spin 1s linear infinite;">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
        </svg>
        Authenticating SEBI 2FA...
      `;
    }

    setTimeout(() => {
      // Save session info dynamically based on user input
      const sessionData = {
        role: currentRole,
        userName: enteredName,
        userInitials: initials,
        identifier: identifier,
        userRoleTitle: currentRole === 'client' ? 'Direct Wealth Investor' : 'Principal Compliance Officer',
        clientId: currentRole === 'client' ? (identifier.startsWith('STK') ? identifier : `STK-IN-${Math.floor(100000 + Math.random() * 900000)}`) : (identifier.startsWith('STK') ? identifier : 'STK-ADM-042'),
        loginTime: new Date().toISOString()
      };
      sessionStorage.setItem('stackly_session', JSON.stringify(sessionData));

      if (window.showToast) {
        window.showToast(`Welcome ${enteredName}! Redirecting to ${currentRole === 'client' ? 'Client' : 'Admin'} Dashboard...`);
      }

      setTimeout(() => {
        if (currentRole === 'client') {
          window.location.href = 'client-dashboard.html';
        } else {
          window.location.href = 'admin-dashboard.html';
        }
      }, 700);
    }, 1000);
  });
}

/* ==========================================================================
   3. SIMULATED 2FA OTP VERIFICATION
   ========================================================================== */
function initOtpVerification() {
  const otpInputs = document.querySelectorAll('.otp-box');
  if (otpInputs.length === 0) return;

  otpInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      if (input.value.length === 1 && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });

    // Handle paste of 6 digits
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasteData = (e.clipboardData || window.clipboardData).getData('text').trim();
      if (/^\d{6}$/.test(pasteData)) {
        otpInputs.forEach((box, i) => {
          box.value = pasteData[i] || '';
        });
        otpInputs[otpInputs.length - 1].focus();
      }
    });
  });
}

/* ==========================================================================
   4. GLOBAL LOGOUT HELPER
   ========================================================================== */
window.stacklyLogout = function() {
  sessionStorage.removeItem('stackly_session');
  if (window.showToast) {
    window.showToast('Logged out securely. Redirecting to login...');
  }
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 600);
};

/* ==========================================================================
   5. GET ACTIVE SESSION HELPER
   ========================================================================== */
window.getStacklySession = function() {
  try {
    const raw = sessionStorage.getItem('stackly_session');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Session retrieval error:', e);
  }
  return null;
};
