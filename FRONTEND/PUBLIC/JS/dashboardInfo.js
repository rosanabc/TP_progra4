document.addEventListener('DOMContentLoaded', async () => {
    const totalReservasCard = document.getElementById('total-reservas');
    const totalPagosCard = document.getElementById('total-pagos');
    const totalClientesCard = document.getElementById('total-clientes');

    try {
        // Obtener total de reservas del mes actual
        const reservasResponse = await fetch('/reservas/total-mes');
        const reservasData = await reservasResponse.json();
        if (reservasData.success) {
            totalReservasCard.textContent = reservasData.total || 0;
        }

        // Obtener ingresos del mes actual
        const pagosResponse = await fetch('/reservas_pagos/ingresos-mes');
        const pagosData = await pagosResponse.json();
        if (pagosData.success) {
            totalPagosCard.textContent = `GS ${pagosData.total}` || 'GS 0';
        }

        // Obtener total de clientes
        const clientesResponse = await fetch('/clientes/total');
        const clientesData = await clientesResponse.json();
        if (clientesData.success) {
            totalClientesCard.textContent = clientesData.total || 0;
        }
    } catch (error) {
        console.error('Error al cargar los datos del dashboard:', error);
    }
});
