// load-data.js
async function loadRegionData(regionName) {
    const apiUrl = 'https://sheetdb.io/api/v1/64fqb9d7ilv65';

    try {
        const response = await fetch(apiUrl);
        const allData = await response.json();

        // Filtrer par région
        const regionData = allData.filter(item =>
            item.Région && item.Région.toLowerCase().includes(regionName.toLowerCase())
        );

        return regionData;
    } catch (error) {
        console.error('Erreur:', error);
        return [];
    }
}

async function displayData(regionName, tableId) {
    const data = await loadRegionData(regionName);
    const tableBody = document.getElementById(tableId);

    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (data.length === 0) {
        tableBody.innerHTML = `
      <tr>
        <td colspan="3">Aucune structure trouvée</td>
      </tr>
    `;
        return;
    }

    data.forEach(structure => {
        const row = document.createElement('tr');
        row.innerHTML = `
      <td>${structure.Structure || ''}</td>
      <td>${structure.Email || ''}</td>
      <td>${structure.Contact || ''}</td>
    `;
        tableBody.appendChild(row);
    });
}