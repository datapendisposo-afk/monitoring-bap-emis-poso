const API_URL =
    "https://script.google.com/macros/s/AKfycbxauRyQz6eSVPdh0NJKhRp64V7vYufiLoc8PdPoEblgwdXP-1usfzJLPZQ8HDJ54HEc/exec";

/* ======================
   ELEMENT
====================== */
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

const filterStatusBap =
    document.getElementById("selStatusBap");

const btnTheme =
    document.getElementById("btnTheme");

const btnExport =
    document.getElementById("btnExport");

const timerEl =
    document.getElementById("timer");

const runningInfo =
    document.getElementById("runningInfo");

const runningTrack =
    document.getElementById("runningTrack");

const popupOverlay =
    document.getElementById("popupOverlay");

const popupContent =
    document.getElementById("popupContent");

const popupClose =
    document.getElementById("popupClose");


/* ======================
   GLOBAL
====================== */
let allData = [];
let charts = {};
let countdownRefresh = 30;
let popupAlreadyShown = false;
let lastRekap = [];
let lastSummary = {};


/* ======================
   HELPER
====================== */
function isSudahBap(status) {
    const value =
        String(status || "")
            .toLowerCase()
            .trim();

    return [
        "1",
        "sudah",
        "sudah bap",
        "true"
    ].includes(value);
}

function getTextColor() {
    return document.documentElement
        .getAttribute("data-theme") === "dark"
        ? "#94a3b8"
        : "#475569";
}


/* ======================
   COUNTDOWN
====================== */
/* ======================
   COUNTDOWN
====================== */
function getCountdown(dateString) {

    // Jika tanggal kosong
    if (!dateString) {
        return "0 Hari 0 Jam 0 Menit 0 Detik";
    }

    const target =
        new Date(dateString).getTime();

    const now =
        new Date().getTime();

    const diff =
        target - now;

    // Jika waktu habis
    if (diff <= 0) {
        return "Selesai";
    }

    const hari =
        Math.floor(diff / 86400000);

    const jam =
        Math.floor(
            (diff % 86400000) / 3600000
        );

    const menit =
        Math.floor(
            (diff % 3600000) / 60000
        );

    const detik =
        Math.floor(
            (diff % 60000) / 1000
        );

    return `
        ${hari} Hari
        ${jam} Jam
        ${menit} Menit
        ${detik} Detik
    `;
}


/* ======================
   LOAD DATA
====================== */
async function loadData() {

    try {

        const response =
            await fetch(API_URL);

        if (!response.ok)
            throw new Error(
                "Gagal koneksi API"
            );

        const result =
            await response.json();

        if (!result.status)
            throw new Error(
                "Status API false"
            );

        allData =
            result.data || [];

        lastRekap =
            result.rekap || [];

        lastSummary =
            result.summary || {};

        renderSummary(
            result.summary
        );

        renderCharts(
            result.rekap,
            result.summary
        );

        renderProgress(
            result.rekap
        );

        renderRanking(
            result.rekap
        );

        renderInfo(
            result.info || []
        );

        filterData();

    } catch (err) {

        console.error(err);

        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="loading">
                    Gagal mengambil data
                </td>
            </tr>
        `;
    }
}


/* ======================
   SUMMARY
====================== */
function renderSummary(summary={}) {

    const total =
        Number(summary.total_madrasah || 0);

    const sudah =
        Number(summary.sudah_bap || 0);

    const belum =
        Number(summary.belum_bap || 0);

    const persen =
        total
        ? Math.round(
            sudah / total * 100
        )
        : 0;

    valSudah.innerText = sudah;
    valBelum.innerText = belum;
    valTotal.innerText = total;
    valPersen.innerText =
        persen + "%";
}


/* ======================
   TABLE
====================== */
function renderTable(data=[]) {

    if (!data.length) {
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
        data.map((item,i)=>`
            <tr>
                <td>${i+1}</td>
                <td>
                    <span class="badge badge-jenjang">
                        ${item.jenjang || "-"}
                    </span>
                </td>
                <td>${item.nama_lembaga || "-"}</td>
                <td>
                    <span class="badge ${
                        isSudahBap(item.status_bap)
                        ? "badge-success"
                        : "badge-danger"
                    }">
                        ${
                            isSudahBap(item.status_bap)
                            ? "Sudah BAP"
                            : "Belum BAP"
                        }
                    </span>
                </td>
            </tr>
        `).join("");
}


/* ======================
   FILTER
====================== */
function filterData() {

    const keyword =
        searchInput.value
            .toLowerCase()
            .trim();

    const jenjang =
        filterJenjang.value;

    const status =
        filterStatusBap.value;

    const filtered =
        allData.filter(item => {

            const nama =
                String(item.nama_lembaga || "")
                .toLowerCase();

            const j =
                item.jenjang;

            const s =
                isSudahBap(item.status_bap)
                ? "SUDAH"
                : "BELUM";

            return (
                nama.includes(keyword)
                &&
                (jenjang==="ALL" || j===jenjang)
                &&
                (status==="ALL" || s===status)
            );
        });

    renderTable(filtered);
}


/* ======================
   INFO
====================== */
function buildInfoText(item) {

    const tipe =
        String(item.tipe || "")
            .toLowerCase()
            .trim();

    const uraian =
        item.uraian || "";

    const tanggal =
        String(item.tanggal || "")
            .trim();

    // ======================
    // COUNTDOWN
    // ======================

    if (
        tipe === "hitungan" &&
        tanggal
    ) {

        return `
            <div class="info-text">
                ⏳ ${uraian}
            </div>

            <div
                class="countdown"
                data-countdown="${tanggal}"
            >
                ${getCountdown(tanggal)}
            </div>
        `;
    }

    // ======================
    // TEXT BIASA
    // ======================

    return `
        <div class="info-text">
            📢 ${uraian}
        </div>
    `;
}

/* ======================
   INFO
====================== */
function renderInfo(data = []) {

    if (!runningInfo || !runningTrack)
        return;

    runningInfo.style.display = "none";
    runningTrack.innerHTML = "";

    const active =
        data.filter(item =>
            String(item.status || "")
                .toLowerCase()
                .trim() === "tampilkan"
        );

    let popupHTML = "";

    active.forEach(item => {

        const jenis =
            String(item.jenis || "")
                .toLowerCase()
                .trim();

        const content =
            buildInfoText(item);

        // RUNNING TEXT
        if (
            jenis === "running" ||
            jenis === "runing"
        ) {

            runningInfo.style.display =
                "flex";

            runningTrack.innerHTML += `
                <span class="running-item">
                    ${content}
                </span>
            `;
        }

        // POPUP
        if (jenis === "popup") {

            popupHTML += `
                <div class="popup-item">
                    ${content}
                </div>
            `;
        }
    });

    // SHOW POPUP
    if (
        popupHTML &&
        !popupAlreadyShown
    ) {

        popupContent.innerHTML =
            popupHTML;

        popupOverlay.classList.add(
            "active"
        );

        popupAlreadyShown = true;
    }
}


/* ======================
   UPDATE COUNTDOWN
====================== */
function updateCountdowns() {

    document
        .querySelectorAll(
            "[data-countdown]"
        )
        .forEach(el => {

            const target =
                el.dataset.countdown;

            el.innerText =
                getCountdown(target);
        });
}


/* ======================
   CHART
====================== */
function initChart(id,type,data){

    const canvas =
        document.getElementById(id);

    if (!canvas) return;

    if (charts[id])
        charts[id].destroy();

    charts[id] =
        new Chart(
            canvas,
            {
                type,
                data,
                options:{
                    responsive:true,
                    maintainAspectRatio:false,
                    plugins:{
                        legend:{
                            position:"bottom",
                            labels:{
                                color:getTextColor()
                            }
                        }
                    }
                }
            }
        );
}

function renderCharts(rekap=[],summary={}){

    const labels =
        rekap.map(x=>x.Jenjang);

    initChart(
        "barChart",
        "bar",
        {
            labels,
            datasets:[
                {
                    label:"Sudah BAP",
                    data:rekap.map(x=>x["Sudah BAP"]),
                    backgroundColor:"#22c55e"
                },
                {
                    label:"Belum BAP",
                    data:rekap.map(x=>x["Belum BAP"]),
                    backgroundColor:"#ef4444"
                }
            ]
        }
    );

    initChart(
        "pieChart",
        "pie",
        {
            labels:["Sudah","Belum"],
            datasets:[{
                data:[
                    summary.sudah_bap || 0,
                    summary.belum_bap || 0
                ],
                backgroundColor:[
                    "#22c55e",
                    "#ef4444"
                ]
            }]
        }
    );
}


/* ======================
   PROGRESS
====================== */
function renderProgress(rekap = []) {

    progressContainer.innerHTML =
        rekap.map(item => {

            const total =
                Number(item["Total"]) || 0;

            const sudah =
                Number(item["Sudah BAP"]) || 0;

            const persen =
                total > 0
                ? Math.round(
                    (sudah / total) * 100
                )
                : 0;

            return `
                <div class="progress-item">

                    <div class="progress-title">
                        <span>${item.Jenjang}</span>
                        <span>${persen}%</span>
                    </div>

                    <div class="progress-track">
                        <div
                            class="progress-bar"
                            style="width:${persen}%">
                        </div>
                    </div>

                </div>
            `;
        }).join("");
}

/* ======================
   RANKING
====================== */
function renderRanking(rekap = []) {

    const sorted =
        [...rekap].sort((a, b) => {

            const totalA =
                Number(a["Total"]) || 0;

            const totalB =
                Number(b["Total"]) || 0;

            const persenA =
                totalA > 0
                ? a["Sudah BAP"] / totalA
                : 0;

            const persenB =
                totalB > 0
                ? b["Sudah BAP"] / totalB
                : 0;

            return persenB - persenA;
        });

    rankingContainer.innerHTML =
        sorted.map((x, i) => {

            const total =
                Number(x["Total"]) || 0;

            const sudah =
                Number(x["Sudah BAP"]) || 0;

            const persen =
                total > 0
                ? Math.round(
                    (sudah / total) * 100
                )
                : 0;

            return `
                <div class="rank-item">

                    <div class="rank-left">

                        <div class="rank-number">
                            ${i + 1}
                        </div>

                        <span>${x.Jenjang}</span>

                    </div>

                    <div class="rank-percent">
                        ${persen}%
                    </div>

                </div>
            `;
        }).join("");
}

/* ======================
   EVENTS
====================== */
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

btnTheme.addEventListener(
    "click",
    ()=>{

        const html =
            document.documentElement;

        const next =
            html.getAttribute(
                "data-theme"
            ) === "dark"
            ? "light"
            : "dark";

        html.setAttribute(
            "data-theme",
            next
        );

        btnTheme.innerText =
            next==="dark"
            ? "🌙 Dark Mode"
            : "☀️ Light Mode";

        renderCharts(
            lastRekap,
            lastSummary
        );
    }
);

btnExport.addEventListener(
    "click",
    async ()=>{

        const element =
            document.querySelector(
                ".container"
            );

        const { jsPDF } =
            window.jspdf;

        const canvas =
            await html2canvas(
                element,
                { scale:2 }
            );

        const img =
            canvas.toDataURL(
                "image/png"
            );

        const pdf =
            new jsPDF(
                "p","mm","a4"
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
            img,
            "PNG",
            0,
            0,
            width,
            height
        );

        pdf.save(
            "Dashboard-BAP-EMIS.pdf"
        );
    }
);

popupClose.addEventListener(
    "click",
    ()=>popupOverlay
        .classList
        .remove("active")
);

popupOverlay.addEventListener(
    "click",
    e=>{
        if (
            e.target === popupOverlay
        ) {
            popupOverlay
                .classList
                .remove("active");
        }
    }
);

document.addEventListener(
    "keydown",
    e=>{
        if (e.key==="Escape")
            popupOverlay
                .classList
                .remove("active");
    }
);


/* ======================
   AUTO REFRESH
====================== */
setInterval(async ()=>{

    countdownRefresh--;

    timerEl.innerText =
        countdownRefresh;

    updateCountdowns();

    if (
        countdownRefresh <= 0
    ) {
        countdownRefresh = 30;
        await loadData();
    }

},1000);


/* ======================
   INIT
====================== */
loadData();
