console.log('auth.js loaded');

// Login handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  console.log('Login form found');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Login form submitted');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (!email || !password) {
      showToast('Please fill all fields', 'danger');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('name', data.name);
        showToast('Login successful');
        setTimeout(() => {
          if (data.role === 'manager') window.location.href = '/manager-dashboard.html';
          else if (data.role === 'delivery') window.location.href = '/delivery-dashboard.html';
          else window.location.href = '/customer-dashboard.html';
        }, 1000);
      } else {
        showToast(data.error, 'danger');
      }
    } catch (err) {
      console.error('Login fetch error:', err);
      showToast('Server error', 'danger');
    }
  });
} else {
  console.error('Login form not found!');
}

// Registration handler
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  console.log('Register form found');
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Register form submitted');
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const address = document.getElementById('address')?.value || '';
    if (!name || !email || !password) {
      showToast('Please fill all required fields', 'danger');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, address })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Registration successful! Please login.');
        setTimeout(() => window.location.href = '/login.html', 1500);
      } else {
        showToast(data.error, 'danger');
      }
    } catch (err) {
      console.error('Register fetch error:', err);
      showToast('Server error', 'danger');
    }
  });
} else {
  console.error('Register form not found!');
}