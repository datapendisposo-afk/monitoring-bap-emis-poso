const API_URL = "URL_APPS_SCRIPT_ANDA";

fetch(API_URL)
  .then(response => response.json())
  .then(data => {

    let totalBap = 0;
    let totalBelum = 0;

    const jenjang = {
      RA: { bap: 0, belum: 0 },
      MI: { bap: 0, belum: 0 },
      MTs: { bap: 0, belum: 0 },
      MA: { bap: 0, belum: 0 }
    };

    const tableBody = document.getElementById("tableBody");

    data.forEach((item, index) => {

      const status = Number(item.status_bap);

      if (status === 1) {

        totalBap++;

        if (jenjang[item.jenjang]) {
          jenjang[item.jenjang].bap++;
        }

      } else {

        totalBelum++;

        if (jenjang[item.jenjang]) {
          jenjang[item.jenjang].belum++;
        }
      }

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${item.no}</td>
        <td>${item.jenjang}</td>
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

    document.getElementById("sudahBap").innerText = totalBap;
    document.getElementById("belumBap").innerText = totalBelum;
    document.getElementById("totalMadrasah").innerText = totalBap + totalBelum;

    const ctx = document.getElementById("chartJenjang");

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['RA', 'MI', 'MTs', 'MA'],
        datasets: [
          {
            label: 'Sudah BAP',
            data: [
              jenjang.RA.bap,
              jenjang.MI.bap,
              jenjang.MTs.bap,
              jenjang.MA.bap
            ]
          },
          {
            label: 'Belum BAP',
            data: [
              jenjang.RA.belum,
              jenjang.MI.belum,
              jenjang.MTs.belum,
              jenjang.MA.belum
            ]
          }
        ]
      }
    });

  });
