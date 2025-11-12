document.addEventListener('DOMContentLoaded', async () => {
    // Configuración del primer gráfico (Canchas)
    const ctx1 = document.getElementById('chart-canchas').getContext('2d');
    // Configuración del segundo gráfico (Reservas por estado)
    const ctx2 = document.getElementById('chart-reservas').getContext('2d');

    try {
        //ESTADO DE LAS CANCHAS
        const response1 = await fetch('/canchas/estado_canchas',{
            method: 'GET',
            credentials: 'include'
        });
        if (!response1.ok) {
            throw new Error(`Error HTTP respuesta 1: ${response1.status}`);
        }

        const data1 = await response1.json();

        if (data1.success) {
            const labels = data1.data.map(item => item.estado);
            const cantidades = data1.data.map(item => item.cantidad);
            const colores = ['#2ecc71', '#ff6b6b', '#f1c40f'];

            new Chart(ctx1, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Canchas por estado',
                        data: cantidades,
                        backgroundColor: colores,
                        borderWidth: 1,
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: true, position: 'bottom' },
                        tooltip: { enabled: true },
                    },
                },
            });
        }

        //ESTADO DE LAS RESERVAS DEL MES
        const response2 = await fetch('/reservas/estado_reservas', {
            method: 'GET',
            credentials: 'include' });
        if (!response2.ok) {
            throw new Error(`Error HTTP respuesta 2: ${response2.status}`);
        }
        const data2 = await response2.json();

        if (data2.success) {
            const labels = data2.data.map(item => item.estado);
            const cantidades = data2.data.map(item => item.cantidad);
            const totalReservas = data2.totalReservasMes;
            const colores = ['#27ae60', '#e74c3c', '#f1c40f'];

            new Chart(ctx2, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Reservas del Mes',
                        data: cantidades,
                        backgroundColor: colores,
                        borderWidth: 1,
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: totalReservas,
                            ticks: {
                                stepSize: 1,
                                precision: 0
                            }
                        },
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: { enabled: true },
                    },
                },
            });
        }
    } catch (error) {
        console.error('Error al cargar los gráficos:', error);
    }
});