const UICharts = {
    mainChart: null,

    init(ctxId) {
        const ctx = document.getElementById(ctxId);
        if (!ctx) return;

        this.mainChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Carbon Footprint (kg CO2)',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointBackgroundColor: '#2ecc71',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        ticks: { color: '#64748b' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#64748b' }
                    }
                }
            }
        });
    },

    update(logs) {
        if (!this.mainChart) return;

        // Group logs by day of week
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const values = new Array(7).fill(0);
        const counts = new Array(7).fill(0);

        // Get recent 7 days
        logs.forEach(log => {
            const date = new Date(log.date);
            const dayIndex = date.getDay();
            values[dayIndex] += log.total;
            counts[dayIndex]++;
        });

        // Reorder values so today is at the end or just map to day names
        // Simple implementation: just use day indices
        this.mainChart.data.datasets[0].data = values;
        this.mainChart.update();
    }
};
