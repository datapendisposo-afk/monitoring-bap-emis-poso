const API_URL = "https://script.google.com/macros/s/AKfycbxauRyQz6eSVPdh0NJKhRp64V7vYufiLoc8PdPoEblgwdXP-1usfzJLPZQ8HDJ54HEc/exec";

const tableBody = document.getElementById("tableBody");

const sudahBapEl = document.getElementById("sudahBap");
const belumBapEl = document.getElementById("belumBap");
const totalMadrasahEl = document.getElementById("totalMadrasah");

const persenBapEl = document.getElementById("persenBap");
const progressFillEl = document.getElementById("progressFill");

const searchInput = document.getElementById("searchInput");

let chartInstance = null;
let allData = [];

// ===============================
// FETCH DATA
// ===============================
async function loadData() {

    try {

        const response = await fetch(API_URL);

        const result = await response.json();

        if (!result.status) {
            alert("Gagal mengambil data");
            return;
        }

        const data = result.data;
        const rekap = result.rekap;
        const summary = result.summary;

        allData = data;

        renderSummary(summary);

        renderTable(data);

        renderChart(rekap);

        renderProgress(summary);

    } catch (error) {

        console.error(error);

        alert("Terjadi kesalahan mengambil data");
    }
}

// ===============================
// SUMMARY
// ===============================
function renderSummary(summary) {

    sudahBapEl.innerText = summary.sudah_bap;
    belumBapEl.innerText = summary.belum_bap;
    totalMadrasahEl.innerText = summary.total_madrasah;
}

// ===============================
// TABLE
// ===============================
function renderTable(data) {

    tableBody.innerHTML = "";

    data.forEach((item) => {

        const status = Number(item.status_bap);

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${item.no}</td>

            <td>
                <span class="badge-jenjang">
                    ${item.jenjang}
                </span>
            </td>

            <td>${item.nama_lembaga}</td>

            <td>
                ${status === 1
                    ? '<span class="success">Sudah BAP</span>'
                    : '<span class="danger">Belum BAP</span>'
                }
            </td>
        `;

        tableBody.appendChild(tr);
    });
}

// ===============================
// CHART
// ===============================
function renderChart(rekap) {

    const labels = [];
    const sudah = [];
    const belum = [];

    rekap.forEach(item => {

        labels.push(item["Jenjang"]);

        sudah.push(Number(item["Sudah BAP"]));

        belum.push(Number(item["Belum BAP"]));
    });

    const ctx = document.getElementById("chartJenjang");

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {

        type: 'bar',

        data: {

            labels: labels,

            datasets: [

                {
                    label: 'Sudah BAP',
                    data: sudah,
                    backgroundColor: '#22c55e',
                    borderRadius: 10
                },

                {
                    label: 'Belum BAP',
                    data: belum,
                    backgroundColor: '#ef4444',
                    borderRadius: 10
                }
            ]
        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {
                    labels: {
                        color: 'white'
                    }
                }
            },

            scales: {

                x: {
                    ticks: {
                        color: 'white'
                    },

                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                },

                y: {
                    beginAtZero: true,

                    ticks: {
                        color: 'white'
                    },

                    grid: {
                        color: 'rgba(255,255,255,0.05)'
                    }
                }
            }
        }
    });
}

// ===============================
// PROGRESS
// ===============================
function renderProgress(summary) {

    const total = Number(summary.total_madrasah);
    const sudah = Number(summary.sudah_bap);

    const persen = total > 0
        ? Math.round((sudah / total) * 100)
        : 0;

    persenBapEl.innerText = `${persen}%`;

    progressFillEl.style.width = `${persen}%`;
}

// ===============================
// SEARCH
// ===============================
searchInput.addEventListener("keyup", function () {

    const keyword = this.value.toLowerCase();

    const filtered = allData.filter(item => {

        return (
            item.nama_lembaga
                .toLowerCase()
                .includes(keyword)
        );
    });

    renderTable(filtered);
});

// ===============================
// AUTO REFRESH
// ===============================
setInterval(() => {

    loadData();

}, 30000);

// ===============================
// LOAD FIRST
// ===============================
loadData();
