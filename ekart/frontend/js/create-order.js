document.getElementById('createOrderForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const pickupAddress = document.getElementById('pickupAddress').value;
  const deliveryAddress = document.getElementById('deliveryAddress').value;
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ pickupAddress, deliveryAddress })
    });
    if (res.ok) {
      showToast('Order created successfully');
      setTimeout(() => window.location.href = '/customer-dashboard.html', 1500);
    } else {
      const data = await res.json();
      showToast(data.error || 'Failed to create order', 'danger');
    }
  } catch (err) {
    showToast('Server error', 'danger');
  }
});