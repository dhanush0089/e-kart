const API_BASE = 'http://localhost:5000/api';

function showToast(message, type = 'success') {
  const container = document.querySelector('.toast-container');
  if (!container) {
    console.warn('Toast container not found');
    return;
  }
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  container.appendChild(toast);
  const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
  bsToast.show();
  toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

function showLoader(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.innerHTML = '<div class="loader"></div>';
}

function hideLoader(elementId, content) {
  const el = document.getElementById(elementId);
  if (el) el.innerHTML = content;
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

function logout() {
  localStorage.clear();
  window.location.href = '/login.html';
}

// Auto-redirect if not logged in
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const publicPages = ['/index.html', '/login.html', '/register.html'];
  const currentPath = window.location.pathname;
  if (!token && !publicPages.includes(currentPath)) {
    window.location.href = '/login.html';
  }
  if (token) {
    const role = localStorage.getItem('role');
    const expected = {
      manager: '/manager-dashboard.html',
      delivery: '/delivery-dashboard.html',
      customer: '/customer-dashboard.html'
    };
    const currentFile = currentPath.split('/').pop();
    if (expected[role] && !currentFile.includes(role) && !publicPages.includes(currentPath) && currentFile !== 'create-order.html' && currentFile !== 'track-order.html') {
      window.location.href = expected[role];
    }
  }
});