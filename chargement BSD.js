// database.js - Script pour charger et gérer la base de données

class DatabaseManager {
    constructor() {
        this.data = null;
        this.currentRegion = null;
    }

    // Charger la base de données depuis le fichier JSON
    async load() {
        try {
            const response = await fetch('structures.json');
            this.data = await response.json();
            console.log('Base de données chargée avec succès');
            return this.data;
        } catch (error) {
            console.error('Erreur de chargement de la base de données:', error);
            return null;
        }
    }

    // Obtenir toutes les régions
    getRegions() {
        return this.data ? this.data.regions : [];
    }

    // Obtenir une région par son ID
    getRegion(regionId) {
        if (!this.data) return null;
        return this.data.regions.find(r => r.id === regionId);
    }

    // Obtenir toutes les structures d'une région
    getStructuresByRegion(regionId) {
        const region = this.getRegion(regionId);
        return region ? region.structures : [];
    }

    // Rechercher une structure par son nom
    searchStructure(searchTerm) {
        if (!this.data) return [];

        const results = [];
        this.data.regions.forEach(region => {
            region.structures.forEach(structure => {
                if (structure.nom.toLowerCase().includes(searchTerm.toLowerCase())) {
                    results.push({
                        ...structure,
                        region: region.nom
                    });
                }
            });
        });
        return results;
    }

    // Obtenir les statistiques
    getStats() {
        return this.data ? this.data.statistiques : null;
    }

    // Générer le HTML d'un tableau pour une région
    generateTableHTML(regionId) {
        const structures = this.getStructuresByRegion(regionId);

        if (structures.length === 0) {
            return '<p>Aucune structure disponible pour cette région.</p>';
        }

        let html = `
      <div class="table-wrap">
        <table>
          <caption>Liste des structures</caption>
          <thead>
            <tr>
              <th>Structure</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Ville</th>
            </tr>
          </thead>
          <tbody>
    `;

        structures.forEach(structure => {
            html += `
        <tr data-id="${structure.id}">
          <td>${structure.nom}</td>
          <td><a href="mailto:${structure.email}">${structure.email}</a></td>
          <td>${structure.contact}</td>
          <td>${structure.ville || '-'}</td>
        </tr>
      `;
        });

        html += `
          </tbody>
        </table>
      </div>
    `;

        return html;
    }

    // Générer le HTML de la navigation dynamique
    generateNavHTML() {
        const regions = this.getRegions();
        let html = '';

        regions.forEach(region => {
            html += `<a href="${region.page}">${region.nom}</a>`;
        });

        return html;
    }
}

// Initialiser le gestionnaire de base de données
const db = new DatabaseManager();

// Fonction d'initialisation pour chaque page
async function initPage(regionId) {
    await db.load();

    // Mettre à jour le tableau si on est sur une page régionale
    if (regionId) {
        const container = document.querySelector('main .container');
        if (container) {
            const tableHTML = db.generateTableHTML(regionId);
            container.innerHTML = tableHTML;
        }
    }

    // Ajouter une barre de recherche
    addSearchBar();
}

// Ajouter une barre de recherche
function addSearchBar() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const searchHTML = `
    <div style="margin-top: 16px;">
      <input 
        type="text" 
        id="searchInput" 
        placeholder="Rechercher une structure..."
        style="padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px; background: var(--panel); color: var(--text); width: 300px;"
      />
      <div id="searchResults" style="margin-top: 8px;"></div>
    </div>
  `;

    header.insertAdjacentHTML('beforeend', searchHTML);

    // Gestionnaire d'événements pour la recherche
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();

        if (searchTerm.length < 2) {
            searchResults.innerHTML = '';
            return;
        }

        const results = db.searchStructure(searchTerm);

        if (results.length === 0) {
            searchResults.innerHTML = '<p style="color: var(--muted);">Aucun résultat trouvé</p>';
            return;
        }

        let html = '<div class="card" style="margin-top: 8px;"><h3>Résultats de recherche:</h3><ul style="list-style: none; padding: 0;">';
        results.forEach(result => {
            html += `
        <li style="padding: 8px 0; border-bottom: 1px solid var(--border);">
          <strong>${result.nom}</strong> (${result.region})<br>
          <small>📧 ${result.email} | 📞 ${result.contact}</small>
        </li>
      `;
        });
        html += '</ul></div>';

        searchResults.innerHTML = html;
    });
}

// Exporter pour utilisation globale
window.DatabaseManager = DatabaseManager;
window.db = db;
window.initPage = initPage;