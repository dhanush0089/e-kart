async function loadManagerDashboard() {
  showLoader('customersTable');
  showLoader('deliveryTable');
  showLoader('ordersTable');
  try {
    const usersRes = await fetch(`${API_BASE}/users`, { headers: getAuthHeaders() });
    const users = await usersRes.json();
    const ordersRes = await fetch(`${API_BASE}/orders`, { headers: getAuthHeaders() });
    const orders = await ordersRes.json();

    // Customers table
    let customersHtml = '<table class="table table-bordered"><thead><tr><th>Name</th><th>Email</th><th>Address</th></tr></thead><tbody>';
    users.customers.forEach(c => {
      customersHtml += `<tr><td>${c.name}</td><td>${c.email}</td><td>${c.address || '-'}</td></tr>`;
    });
    customersHtml += '</tbody></table>';
    hideLoader('customersTable', customersHtml);

    // Delivery men table
    let deliveryHtml = '<table class="table table-bordered"><thead><tr><th>Name</th><th>Email</th><th>Action</th></tr></thead><tbody>';
    users.deliveryMen.forEach(d => {
      deliveryHtml += `<tr><td>${d.name}</td><td>${d.email}</td><td><button class="btn btn-sm btn-primary" onclick="sendMessage('${d._id}')">Send Message</button></td></tr>`;
    });
    deliveryHtml += '</tbody></table>';
    hideLoader('deliveryTable', deliveryHtml);

    // Orders table
    let ordersHtml = '<table class="table table-bordered"><thead><tr><th>Customer</th><th>Delivery Address</th><th>Status</th><th>Delivery Man</th><th>Assign</th></tr></thead><tbody>';
    orders.forEach(o => {
      ordersHtml += `<tr>
        <td>${o.customerId?.name || 'N/A'}</td>
        <td>${o.deliveryAddress}</td>
        <td>${o.status}</td>
        <td>${o.deliveryManId?.name || 'Unassigned'}</td>
        <td>
          <select id="assign-${o._id}" class="form-select form-select-sm">
            <option value="">Select delivery man</option>
            ${users.deliveryMen.map(d => `<option value="${d._id}">${d.name}</option>`).join('')}
          </select>
          <button class="btn btn-sm btn-success mt-1" onclick="assignOrder('${o._id}')">Assign</button>
        </td>
      </tr>`;
    });
    ordersHtml += '</tbody></table>';
    hideLoader('ordersTable', ordersHtml);
  } catch (err) {
    showToast('Failed to load data', 'danger');
  }
}

window.assignOrder = async (orderId) => {
  const select = document.getElementById(`assign-${orderId}`);
  const deliveryManId = select.value;
  if (!deliveryManId) {
    showToast('Please select a delivery man', 'danger');
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/assign`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ orderId, deliveryManId })
    });
    if (res.ok) {
      showToast('Order assigned successfully');
      loadManagerDashboard();
    } else {
      showToast('Assignment failed', 'danger');
    }
  } catch (err) {
    showToast('Error', 'danger');
  }
};

window.sendMessage = async (toDeliveryId) => {
  const message = prompt('Enter message for delivery person:');
  if (!message) return;
  try {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ toDeliveryId, message })
    });
    if (res.ok) showToast('Message sent');
    else showToast('Failed', 'danger');
  } catch (err) {
    showToast('Error', 'danger');
  }
};

document.addEventListener('DOMContentLoaded', loadManagerDashboard);