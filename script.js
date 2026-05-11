const API_URL = "https://script.google.com/macros/s/AKfycbxauRyQz6eSVPdh0NJKhRp64V7vYufiLoc8PdPoEblgwdXP-1usfzJLPZQ8HDJ54HEc/exec";

// Elemen DOM
const tableBody = document.getElementById("tableBody");
const sudahBapEl = document.getElementById("sudahBap");
const belumBapEl = document.getElementById("belumBap");
const totalMadrasahEl = document.getElementById("totalMadrasah");
const persenTotalEl = document.getElementById("persenTotal");
const progressContainer = document.getElementById("progressContainer");
const rankingContainer = document.getElementById("rankingContainer");

let charts = {}; // Objek untuk menyimpan semua instance chart
let allData = [];

async function loadData() {
    try {
        const response = await fetch(API_URL);
        const result = await response.json();
        if (!result.status) return;

        allData = result.data;
        
        renderSummary(result.summary);
        renderTable(allData);
        renderCharts(result.rekap, result.summary);
        renderJenjangProgress(result.rekap);
        renderRanking(result.rekap);

    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

function renderSummary(summary) {
    sudahBapEl.innerText = summary.sudah_bap;
    belumBapEl.innerText = summary.belum_bap;
    totalMadrasahEl.innerText = summary.total_madrasah;
    
    const persen = Math.round((summary.sudah_bap / summary.total_madrasah) * 100);
    persenTotalEl.innerText = `${persen}%`;
}

function renderTable(data) {
    tableBody.innerHTML = data.map(item => `
        <tr>
            <td>${item.no}</td>
            <td><span class="badge-jenjang">${item.jenjang}</span></td>
            <td>${item.nama_lembaga}</td>
            <td>
                <span class="${item.status_bap == 1 ? 'success' : 'danger'}">
                    ${item.status_bap == 1 ? 'Sudah BAP' : 'Belum BAP'}
                </span>
            </td>
        </tr>
    `).join('');
}

function renderCharts(rekap, summary) {
    const labels = rekap.map(item => item.Jenjang);
    const sudahData = rekap.map(item => item["Sudah BAP"]);
    const belumData = rekap.map(item => item["Belum BAP"]);

    // 1. Bar Chart (Progres per Jenjang)
    initChart('chartJenjang', 'bar', {
        labels: labels,
        datasets: [
            { label: 'Sudah', data: sudahData, backgroundColor: '#22c55e' },
            { label: 'Belum', data: belumData, backgroundColor: '#ef4444' }
        ]
    });

    // 2. Pie Chart (Total Status)
    initChart('pieChart', 'pie', {
        labels: ['Sudah BAP', 'Belum BAP'],
        datasets: [{
            data: [summary.sudah_bap, summary.belum_bap],
            backgroundColor: ['#22c55e', '#ef4444']
        }]
    });

    // 3. Donut Chart (Distribusi Madrasah)
    initChart('donutChart', 'doughnut', {
        labels: labels,
        datasets: [{
            data: rekap.map(item => item["Total"]),
            backgroundColor: ['#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899']
        }]
    });
}

function initChart(id, type, data) {
    const ctx = document.getElementById(id).getContext('2d');
    if (charts[id]) charts[id].destroy();
    charts[id] = new Chart(ctx, {
        type: type,
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#fff' } } }
        }
    });
}

function renderJenjangProgress(rekap) {
    progressContainer.innerHTML = rekap.map(item => {
        const p = Math.round((item["Sudah BAP"] / item["Total"]) * 100);
        return `
            <div class="progress-item">
                <div class="progress-title">
                    <span>${item.Jenjang}</span>
                    <span>${p}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${p}%; background: var(--blue)"></div>
                </div>
            </div>
        `;
    }).join('');
}

function renderRanking(rekap) {
    const sorted = [...rekap].sort((a, b) => 
        (b["Sudah BAP"]/b["Total"]) - (a["Sudah BAP"]/a["Total"])
    );
    
    rankingContainer.innerHTML = sorted.map((item, index) => `
        <div class="rank-item">
            <div style="display:flex; align-items:center; gap:15px;">
                <div class="rank-number">${index + 1}</div>
                <span>${item.Jenjang}</span>
            </div>
            <span style="font-weight:bold">${Math.round((item["Sudah BAP"]/item["Total"])*100)}%</span>
        </div>
    `).join('');
}

// Fitur Filter Jenjang
document.getElementById('filterJenjang').addEventListener('change', function() {
    const val = this.value;
    const filtered = val === 'ALL' ? allData : allData.filter(d => d.jenjang === val);
    renderTable(filtered);
});

// Fitur Search
document.getElementById('searchInput').addEventListener('input', function() {
    const val = this.value.toLowerCase();
    const filtered = allData.filter(d => d.nama_lembaga.toLowerCase().includes(val));
    renderTable(filtered);
});

// Theme Toggle
document.getElementById('themeToggle').addEventListener('click', () => {
    const body = document.documentElement;
    const isDark = body.getAttribute('data-theme') === 'dark';
    body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    document.getElementById('themeToggle').innerText = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
});

loadData();
setInterval(loadData, 30000);
