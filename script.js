const API_URL =
    "https://script.google.com/macros/s/AKfycbxauRyQz6eSVPdh0NJKhRp64V7vYufiLoc8PdPoEblgwdXP-1usfzJLPZQ8HDJ54HEc/exec";

// ======================
// ELEMENT
// ======================

const tableBody =
    document.getElementById("tableBody");

const valSudah =
    document.getElementById("valSudah");

const valBelum =
    document.getElementById("valBelum");

const valTotal =
    document.getElementById("valTotal");

const valPersen =
    document.getElementById("valPersen");

const progressContainer =
    document.getElementById("progressContainer");

const rankingContainer =
    document.getElementById("rankingContainer");

const searchInput =
    document.getElementById("inpSearch");

const filterJenjang =
    document.getElementById("selJenjang");

const filterStatusBap =
    document.getElementById("selStatusBap");

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

let lastRekap = [];

let lastSummary = {};

// ======================
// HELPER STATUS
// ======================

function isSudahBap(status) {

    const value =
        String(status || "")
            .toLowerCase()
            .trim();

    return (
        value === "1" ||
        value === "sudah" ||
        value === "sudah bap" ||
        value === "true"
    );
}

// ======================
// LOAD DATA
// ======================

async function loadData() {

    try {

        const response =
            await fetch(API_URL);

        const result =
            await response.json();

        console.log(result);

        if (!result.status) {

            console.error(
                "Response status false"
            );

            return;
        }

        allData = result.data || [];

        lastRekap = result.rekap || [];

        lastSummary = result.summary || {};

        renderSummary(result.summary);

        renderCharts(
            result.rekap,
            result.summary
        );

        renderProgress(result.rekap);

        renderRanking(result.rekap);

        filterData();

    } catch (error) {

        console.error(
            "Fetch Error:",
            error
        );

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

    const total =
        Number(summary.total_madrasah || 0);

    const sudah =
        Number(summary.sudah_bap || 0);

    const belum =
        Number(summary.belum_bap || 0);

    valSudah.innerText = sudah;
    valBelum.innerText = belum;
    valTotal.innerText = total;

    const persen =
        total > 0
        ? Math.round((sudah / total) * 100)
        : 0;

    valPersen.innerText =
        persen + "%";
}

// ======================
// TABLE
// ======================

function renderTable(data) {

    if (!data || data.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="loading">
                    Data tidak ditemukan
                </td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML =
        data.map(item => {

            return `
                <tr>

                    <td>${item.no || "-"}</td>

                    <td>
                        <span class="badge badge-jenjang">
                            ${item.jenjang || "-"}
                        </span>
                    </td>

                    <td>
                        ${item.nama_lembaga || "-"}
                    </td>

                    <td>
                        <span class="
                            badge
                            ${isSudahBap(item.status_bap)
                                ? "badge-success"
                                : "badge-danger"}
                        ">

                            ${isSudahBap(item.status_bap)
                                ? "Sudah BAP"
                                : "Belum BAP"}

                        </span>
                    </td>

                </tr>
            `;

        }).join("");
}

// ======================
// FILTER
// ======================

function filterData() {

    const keyword =
        searchInput.value
            .toLowerCase()
            .trim();

    const jenjang =
        filterJenjang.value;

    const statusFilter =
        filterStatusBap.value;

    const filtered =
        allData.filter(item => {

            const nama =
                String(
                    item.nama_lembaga || ""
                ).toLowerCase();

            const itemJenjang =
                String(
                    item.jenjang || ""
                ).trim();

            const statusValue =
                isSudahBap(item.status_bap)
                ? "SUDAH"
                : "BELUM";

            const matchSearch =
                nama.includes(keyword);

            const matchJenjang =
                jenjang === "ALL" ||
                itemJenjang === jenjang;

            const matchStatus =
                statusFilter === "ALL" ||
                statusValue === statusFilter;

            return (
                matchSearch &&
                matchJenjang &&
                matchStatus
            );
        });

    renderTable(filtered);
}

// ======================
// EVENT
// ======================

searchInput.addEventListener(
    "input",
    filterData
);

filterJenjang.addEventListener(
    "change",
    filterData
);

filterStatusBap.addEventListener(
    "change",
    filterData
);

// ======================
// CHARTS
// ======================

function renderCharts(rekap, summary) {

    const labels =
        rekap.map(r => r.Jenjang);

    const sudah =
        rekap.map(r =>
            Number(r["Sudah BAP"])
        );

    const belum =
        rekap.map(r =>
            Number(r["Belum BAP"])
        );

    const total =
        rekap.map(r =>
            Number(r["Total"])
        );

    // BAR
    initChart(
        "barChart",
        "bar",
        {
            labels,

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
            labels,

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

    const canvas =
        document.getElementById(id);

    if (!canvas) return;

    const ctx =
        canvas.getContext("2d");

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

            scales:
                type === "bar"
                ? {

                    x: {

                        ticks: {
                            color: getTextColor()
                        },

                        grid: {
                            color:
                            "rgba(255,255,255,0.05)"
                        }
                    },

                    y: {

                        beginAtZero: true,

                        ticks: {
                            color: getTextColor()
                        },

                        grid: {
                            color:
                            "rgba(255,255,255,0.05)"
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

            const total =
                Number(item["Total"]);

            const sudah =
                Number(item["Sudah BAP"]);

            const persen =
                total > 0
                ? Math.round((sudah / total) * 100)
                : 0;

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
        }).join("");
}

// ======================
// RANKING
// ======================

function renderRanking(rekap) {

    const sorted =
        [...rekap].sort((a, b) => {

            const persenA =
                a["Total"] > 0
                ? a["Sudah BAP"] / a["Total"]
                : 0;

            const persenB =
                b["Total"] > 0
                ? b["Sudah BAP"] / b["Total"]
                : 0;

            return persenB - persenA;
        });

    rankingContainer.innerHTML =
        sorted.map((item, index) => {

            const persen =
                item["Total"] > 0
                ? Math.round(
                    (item["Sudah BAP"] /
                    item["Total"]) * 100
                )
                : 0;

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
        }).join("");
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

        const next =
            current === "dark"
            ? "light"
            : "dark";

        html.setAttribute(
            "data-theme",
            next
        );

        btnTheme.innerText =
            next === "dark"
            ? "🌙 Dark Mode"
            : "☀️ Light Mode";

        renderCharts(
            lastRekap,
            lastSummary
        );
    }
);

// ======================
// EXPORT PDF
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

            const width =
                pdf.internal
                    .pageSize
                    .getWidth();

            const height =
                canvas.height *
                width /
                canvas.width;

            pdf.addImage(
                imgData,
                "PNG",
                0,
                0,
                width,
                height
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
// COLOR
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
// INITIAL LOAD
// ======================

loadData();
