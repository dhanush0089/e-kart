async function loadDeliveryDashboard() {
  showLoader('deliveriesTable');
  showLoader('messagesList');
  try {
    const ordersRes = await fetch(`${API_BASE}/orders`, { headers: getAuthHeaders() });
    const orders = await ordersRes.json();
    const messagesRes = await fetch(`${API_BASE}/messages`, { headers: getAuthHeaders() });
    const messages = await messagesRes.json();

    let deliveriesHtml = '<table class="table table-bordered"><thead><tr><th>Pickup Address</th><th>Delivery Address</th><th>Customer</th><th>Status</th><th>Update Status</th></tr></thead><tbody>';
    orders.forEach(o => {
      deliveriesHtml += `<tr>
        <td>${o.pickupAddress}</td>
        <td>${o.deliveryAddress}</td>
        <td>${o.customerId?.name || 'N/A'}<br>${o.customerId?.address || ''}</td>
        <td id="status-text-${o._id}">${o.status}</td>
        <td>
          <select id="status-${o._id}" class="form-select form-select-sm">
            <option ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option ${o.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
            <option ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
          </select>
          <button class="btn btn-sm btn-primary mt-1" onclick="updateStatus('${o._id}')">Update</button>
        </td>
      </tr>`;
    });
    deliveriesHtml += '</tbody></table>';
    hideLoader('deliveriesTable', deliveriesHtml);

    let messagesHtml = '<div class="list-group">';
    messages.forEach(m => {
      messagesHtml += `<div class="list-group-item"><strong>From Manager:</strong> ${m.message}<br><small class="text-muted">${new Date(m.createdAt).toLocaleString()}</small></div>`;
    });
    messagesHtml += '</div>';
    hideLoader('messagesList', messagesHtml);
  } catch (err) {
    showToast('Failed to load data', 'danger');
  }
}

window.updateStatus = async (orderId) => {
  const newStatus = document.getElementById(`status-${orderId}`).value;
  try {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) {
      showToast('Status updated');
      document.getElementById(`status-text-${orderId}`).innerText = newStatus;
    } else {
      showToast('Update failed', 'danger');
    }
  } catch (err) {
    showToast('Error', 'danger');
  }
};

document.addEventListener('DOMContentLoaded', loadDeliveryDashboard);