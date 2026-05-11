const API_URL = "https://script.google.com/macros/s/AKfycbxauRyQz6eSVPdh0NJKhRp64V7vYufiLoc8PdPoEblgwdXP-1usfzJLPZQ8HDJ54HEc/exec";

// ======================
// ELEMENT
// ======================

const tableBody = document.getElementById("tableBody");

const valSudah = document.getElementById("valSudah");
const valBelum = document.getElementById("valBelum");
const valTotal = document.getElementById("valTotal");
const valPersen = document.getElementById("valPersen");

const progressContainer =
    document.getElementById("progressContainer");

const rankingContainer =
    document.getElementById("rankingContainer");

const searchInput =
    document.getElementById("inpSearch");

const filterJenjang =
    document.getElementById("selJenjang");

const btnTheme =
    document.getElementById("btnTheme");

const btnExport =
    document.getElementById("btnExport");

const timerEl =
    document.getElementById("timer");

// ======================
// GLOBAL
// ======================

let allData = [];

let charts = {};

let countdown = 30;

// ======================
// LOAD DATA
// ======================

async function loadData() {

    try {

        const response = await fetch(API_URL);

        const result = await response.json();

        console.log(result);

        if (!result.status) {

            alert("Gagal mengambil data");

            return;
        }

        allData = result.data;

        renderSummary(result.summary);

        renderTable(allData);

        renderCharts(
            result.rekap,
            result.summary
        );

        renderProgress(result.rekap);

        renderRanking(result.rekap);

    } catch (error) {

        console.error(error);

        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="loading">
                    Gagal mengambil data
                </td>
            </tr>
        `;
    }
}

// ======================
// SUMMARY
// ======================

function renderSummary(summary) {

    valSudah.innerText =
        summary.sudah_bap;

    valBelum.innerText =
        summary.belum_bap;

    valTotal.innerText =
        summary.total_madrasah;

    const persen =
        Math.round(
            (summary.sudah_bap /
            summary.total_madrasah) * 100
        );

    valPersen.innerText =
        persen + "%";
}

// ======================
// TABLE
// ======================

function renderTable(data) {

    if (data.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="loading">
                    Data tidak ditemukan
                </td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML = data.map(item => `

        <tr>

            <td>${item.no}</td>

            <td>
                <span class="badge badge-jenjang">
                    ${item.jenjang}
                </span>
            </td>

            <td>${item.nama_lembaga}</td>

            <td>
                <span class="
                    badge
                    ${item.status_bap == 1
                        ? 'badge-success'
                        : 'badge-danger'}
                ">

                    ${item.status_bap == 1
                        ? 'Sudah BAP'
                        : 'Belum BAP'}

                </span>
            </td>

        </tr>

    `).join('');
}

// ======================
// CHARTS
// ======================

function renderCharts(rekap, summary) {

    const labels =
        rekap.map(item => item.Jenjang);

    const sudah =
        rekap.map(item =>
            Number(item["Sudah BAP"])
        );

    const belum =
        rekap.map(item =>
            Number(item["Belum BAP"])
        );

    const total =
        rekap.map(item =>
            Number(item["Total"])
        );

    // BAR CHART
    initChart(
        "barChart",
        "bar",
        {
            labels: labels,

            datasets: [

                {
                    label: "Sudah BAP",
                    data: sudah,
                    backgroundColor: "#22c55e",
                    borderRadius: 10
                },

                {
                    label: "Belum BAP",
                    data: belum,
                    backgroundColor: "#ef4444",
                    borderRadius: 10
                }
            ]
        }
    );

    // PIE
    initChart(
        "pieChart",
        "pie",
        {
            labels: [
                "Sudah BAP",
                "Belum BAP"
            ],

            datasets: [

                {
                    data: [
                        summary.sudah_bap,
                        summary.belum_bap
                    ],

                    backgroundColor: [
                        "#22c55e",
                        "#ef4444"
                    ]
                }
            ]
        }
    );

    // DONUT
    initChart(
        "donutChart",
        "doughnut",
        {
            labels: labels,

            datasets: [

                {
                    data: total,

                    backgroundColor: [
                        "#3b82f6",
                        "#8b5cf6",
                        "#f59e0b",
                        "#ec4899"
                    ],

                    borderWidth: 0
                }
            ]
        }
    );
}

// ======================
// INIT CHART
// ======================

function initChart(id, type, data) {

    const ctx =
        document
            .getElementById(id)
            .getContext("2d");

    if (charts[id]) {

        charts[id].destroy();
    }

    charts[id] = new Chart(ctx, {

        type: type,

        data: data,

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    position: "bottom",

                    labels: {

                        color: getTextColor()
                    }
                }
            },

            scales: type === "bar"
                ? {

                    x: {

                        ticks: {
                            color: getTextColor()
                        },

                        grid: {
                            color: "rgba(255,255,255,0.05)"
                        }
                    },

                    y: {

                        beginAtZero: true,

                        ticks: {
                            color: getTextColor()
                        },

                        grid: {
                            color: "rgba(255,255,255,0.05)"
                        }
                    }
                }
                : {}
        }
    });
}

// ======================
// PROGRESS
// ======================

function renderProgress(rekap) {

    progressContainer.innerHTML =
        rekap.map(item => {

            const persen =
                Math.round(
                    (item["Sudah BAP"] /
                    item["Total"]) * 100
                );

            return `

                <div class="progress-item">

                    <div class="progress-title">

                        <span>
                            ${item.Jenjang}
                        </span>

                        <span>
                            ${persen}%
                        </span>

                    </div>

                    <div class="progress-track">

                        <div
                            class="progress-bar"
                            style="width:${persen}%"
                        ></div>

                    </div>

                </div>

            `;
        }).join('');
}

// ======================
// RANKING
// ======================

function renderRanking(rekap) {

    const sorted =
        [...rekap].sort((a, b) => {

            return (
                (b["Sudah BAP"] / b["Total"]) -
                (a["Sudah BAP"] / a["Total"])
            );
        });

    rankingContainer.innerHTML =
        sorted.map((item, index) => {

            const persen =
                Math.round(
                    (item["Sudah BAP"] /
                    item["Total"]) * 100
                );

            return `

                <div class="rank-item">

                    <div class="rank-left">

                        <div class="rank-number">
                            ${index + 1}
                        </div>

                        <span>
                            ${item.Jenjang}
                        </span>

                    </div>

                    <div class="rank-percent">
                        ${persen}%
                    </div>

                </div>

            `;
        }).join('');
}

// ======================
// SEARCH
// ======================

searchInput.addEventListener(
    "input",
    filterData
);

// ======================
// FILTER
// ======================

filterJenjang.addEventListener(
    "change",
    filterData
);

function filterData() {

    const keyword =
        searchInput.value.toLowerCase();

    const jenjang =
        filterJenjang.value;

    const filtered =
        allData.filter(item => {

            const matchSearch =
                item.nama_lembaga
                    .toLowerCase()
                    .includes(keyword);

            const matchJenjang =
                jenjang === "ALL" ||
                item.jenjang === jenjang;

            return (
                matchSearch &&
                matchJenjang
            );
        });

    renderTable(filtered);
}

// ======================
// THEME
// ======================

btnTheme.addEventListener(
    "click",
    () => {

        const html =
            document.documentElement;

        const current =
            html.getAttribute("data-theme");

        const target =
            current === "dark"
            ? "light"
            : "dark";

        html.setAttribute(
            "data-theme",
            target
        );

        btnTheme.innerText =
            target === "dark"
            ? "🌙 Dark Mode"
            : "☀️ Light Mode";

        loadData();
    }
);

// ======================
// PDF EXPORT
// ======================

btnExport.addEventListener(
    "click",
    () => {

        const element =
            document.getElementById(
                "capture-area"
            );

        const { jsPDF } =
            window.jspdf;

        html2canvas(element, {

            scale: 2

        }).then(canvas => {

            const imgData =
                canvas.toDataURL(
                    "image/png"
                );

            const pdf =
                new jsPDF(
                    "p",
                    "mm",
                    "a4"
                );

            const imgProps =
                pdf.getImageProperties(
                    imgData
                );

            const pdfWidth =
                pdf.internal
                    .pageSize
                    .getWidth();

            const pdfHeight =
                (imgProps.height *
                pdfWidth) /
                imgProps.width;

            pdf.addImage(
                imgData,
                "PNG",
                0,
                0,
                pdfWidth,
                pdfHeight
            );

            pdf.save(
                "Dashboard-BAP-EMIS.pdf"
            );
        });
    }
);

// ======================
// TIMER
// ======================

setInterval(async () => {

    countdown--;

    timerEl.innerText =
        countdown;

    if (countdown <= 0) {

        countdown = 30;

        await loadData();
    }

}, 1000);

// ======================
// TEXT COLOR
// ======================

function getTextColor() {

    return document
        .documentElement
        .getAttribute("data-theme")
        === "dark"

        ? "#94a3b8"

        : "#475569";
}

// ======================
// FIRST LOAD
// ======================

loadData();
