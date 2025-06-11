document.addEventListener('DOMContentLoaded', () => {
    const cartId = window.location.pathname.split('/').pop();

    // Eliminar producto individual
    document.querySelectorAll('.remove-product-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const pid = this.getAttribute('data-pid');
            if (confirm('¿Eliminar este producto del carrito?')) {
                const res = await fetch(`/api/carts/${cartId}/product/${pid}`, { method: 'DELETE' });
                const result = await res.json();
                if (result.status === 'success') {
                    location.reload();
                } else {
                    alert(result.message || 'Error al eliminar producto');
                }
            }
        });
    });

    // Vaciar carrito
    document.getElementById('empty-cart-btn').addEventListener('click', async function() {
        if (confirm('¿Vaciar todo el carrito?')) {
            const res = await fetch(`/api/carts/${cartId}`, { method: 'DELETE' });
            const result = await res.json();
            if (result.status === 'success') {
                location.reload();
            } else {
                alert(result.message || 'Error al vaciar carrito');
            }
        }
    });
});