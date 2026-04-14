async function loadCustomerDashboard() {
  showLoader('ordersTable');
  try {
    const res = await fetch(`${API_BASE}/orders`, { headers: getAuthHeaders() });
    const orders = await res.json();
    let html = '<table class="table table-bordered"><thead><tr><th>Delivery Address</th><th>Status</th><th>Delivery Person</th><th>Track</th></tr></thead><tbody>';
    orders.forEach(o => {
      html += `<tr>
        <td>${o.deliveryAddress}</td>
        <td>${o.status}</td>
        <td>${o.deliveryManId?.name || 'Not assigned'}</td>
        <td><a href="/track-order.html?id=${o._id}" class="btn btn-sm btn-info">Track</a></td>
      </tr>`;
    });
    html += '</tbody></table>';
    hideLoader('ordersTable', html);
  } catch (err) {
    showToast('Failed to load orders', 'danger');
  }
}

document.addEventListener('DOMContentLoaded', loadCustomerDashboard);