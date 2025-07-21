document.addEventListener('DOMContentLoaded', () => {
    const cartId = window.location.pathname.split('/').pop();

    // Calcular total del carrito
    function calculateCartTotal() {
        let total = 0;
        document.querySelectorAll('.product-card').forEach(card => {
            const priceText = card.querySelector('p:nth-of-type(2)').textContent;
            const quantityText = card.querySelector('p:nth-of-type(3)').textContent;
            
            const price = parseFloat(priceText.replace('Precio: $ ', ''));
            const quantity = parseInt(quantityText.replace('Cantidad: ', ''));
            
            total += price * quantity;
        });
        
        const totalElement = document.getElementById('cart-total');
        if (totalElement) {
            totalElement.textContent = total.toFixed(2);
        }
    }

    // Calcular total al cargar la página
    calculateCartTotal();

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

    // Finalizar compra (checkout)
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async function() {
            if (confirm('¿Confirmas que deseas finalizar la compra?')) {
                try {
                    // Deshabilitar botón durante la petición
                    this.disabled = true;
                    this.textContent = 'Procesando...';

                    // Obtener token de autenticación
                    const authToken = localStorage.getItem('authToken');
                    
                    if (!authToken) {
                        alert('Debes iniciar sesión para realizar una compra');
                        window.location.href = '/login';
                        return;
                    }

                    const res = await fetch('/api/tickets/checkout', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        },
                        body: JSON.stringify({ cartId })
                    });

                    const result = await res.json();
                    
                    if (result.status === 'success') {
                        const ticket = result.data.ticket;
                        const summary = result.data.summary;
                        
                        let message = `¡Compra realizada exitosamente!\n\n`;
                        message += `Código de ticket: ${ticket.code}\n`;
                        message += `Total: $${ticket.amount}\n`;
                        message += `Productos comprados: ${summary.totalPurchased}\n`;
                        message += `Fecha: ${new Date(ticket.purchase_datetime).toLocaleString()}`;
                        
                        // Mostrar productos no disponibles si los hay
                        if (result.data.unavailableProducts && result.data.unavailableProducts.length > 0) {
                            message += `\n\nAtención: Algunos productos no pudieron ser procesados:\n`;
                            result.data.unavailableProducts.forEach(item => {
                                message += `- ${item.title || 'Producto'}: ${item.reason}\n`;
                            });
                        }
                        
                        alert(message);
                        
                        // Redirigir a la página de productos o tickets
                        window.location.href = '/products';
                        
                    } else {
                        alert(result.message || 'Error al procesar la compra');
                    }
                    
                } catch (error) {
                    console.error('Error en checkout:', error);
                    alert('Error de conexión. Inténtalo de nuevo.');
                } finally {
                    // Rehabilitar botón
                    this.disabled = false;
                    this.textContent = 'Finalizar Compra';
                }
            }
        });
    }
});