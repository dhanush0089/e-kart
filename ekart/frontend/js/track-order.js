const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('id');
if (orderId) {
  fetchOrderDetails();
} else {
  document.getElementById('trackStatus').innerHTML = '<div class="alert alert-warning">No order ID provided.</div>';
}

async function fetchOrderDetails() {
  showLoader('trackStatus');
  try {
    const res = await fetch(`${API_BASE}/orders`, { headers: getAuthHeaders() });
    const orders = await res.json();
    const order = orders.find(o => o._id === orderId);
    if (order) {
      let statusClass = '';
      if (order.status === 'Pending') statusClass = 'bg-warning';
      else if (order.status === 'Out for Delivery') statusClass = 'bg-info';
      else statusClass = 'bg-success';
      const html = `
        <div class="card">
          <div class="card-header">Order Tracking</div>
          <div class="card-body">
            <h5 class="card-title">Status: <span class="badge ${statusClass}">${order.status}</span></h5>
            <p><strong>Pickup Address:</strong> ${order.pickupAddress}</p>
            <p><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>
            <p><strong>Assigned to:</strong> ${order.deliveryManId?.name || 'Not assigned yet'}</p>
            <p><strong>Order Created:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>
      `;
      hideLoader('trackStatus', html);
    } else {
      hideLoader('trackStatus', '<div class="alert alert-danger">Order not found.</div>');
    }
  } catch (err) {
    hideLoader('trackStatus', '<div class="alert alert-danger">Error loading order.</div>');
  }
}