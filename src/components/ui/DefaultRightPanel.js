import UIComponent from './UIComponent';
import Sector from '../../shapes/Sector';
export default class DefaultRightPanel extends UIComponent {
  constructor(app) {
    super(app);

    this.render();
    this.addEventListeners();
    this.updateSectorList();
  }

  render() {
    this.panel = document.createElement('div');
    this.panel.id = 'rightDrawingPanel';
    this.panel.innerHTML = `
      <div>
        <div class="panel-header">
          <button id="charsBillPlToggleButton" title="Hide panel">
          👁️
          </button>
          &nbsp; &nbsp;
          Sectors
          <hr>
        </div>
        <div>
          <!-- Panel content -->
          <div style="display: flex; flex-direction: column; gap: 10px; padding: 5px;">
            <div>
              <small>Upload Image: </small> 
              <input type="file" id="upload-image-input" accept="image/*">
            </div>
            <div>
              <small>Upload JSON: </small> 
              <input type="file" id="upload-json-input" accept=".json">
            </div>
            <div>
              <small>Export JSON: </small> 
              <input type="button" id="export-json-button" value="Export">
            </div>
            <div>
              <p>Filter by tag:</p> 
              <input type="text" id="tag-filter-input" placeholder="Enter a tag to filter">
            </div>
          </div>
          <hr>
          <table id="sector-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>Name</th>
                <th>Tags</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    `;
    document.body.appendChild(this.panel);
  }

  addEventListeners() {
    document.getElementById('charsBillPlToggleButton').addEventListener('click', () => this.togglePanel());
    document.getElementById('tag-filter-input').addEventListener('input', () => this.updateSectorList());
    document.getElementById('upload-image-input').addEventListener('change', (e) => this.app.handleImageUpload(e));
    document.getElementById('upload-json-input').addEventListener('change', (e) => this.app.handleJSONUpload(e));
    document.getElementById('export-json-button').addEventListener('click', () => this.app.exportData());
  }

  togglePanel() {
    if (this.panel.classList.contains('hidden')) {
      this.panel.classList.remove('hidden');
    } else {
      this.panel.classList.add('hidden');
    }
  }

  updateSectorList() {
    const tbody = this.panel.querySelector('#sector-table tbody');
    tbody.innerHTML = '';
    const filterTag = document.getElementById('tag-filter-input').value.trim().toLowerCase();

    this.app.sectors.forEach((sector) => {
      if (
        filterTag === '' ||
        sector.tags.map((t) => t.toLowerCase()).includes(filterTag)
      ) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><input type="checkbox" class="sector-select"></td>
          <td>${sector.name}</td>
          <td>${sector.tags.join(', ')}</td>
          <td>
            <button class="edit-button">Edit</button>
            <button class="delete-button">Delete</button>
          </td>
        `;
        tbody.appendChild(row);

        row.querySelector('.edit-button').addEventListener('click', () => this.app.ui.sectorDialog.open(sector));
        row.querySelector('.delete-button').addEventListener('click', () => this.deleteSector(sector));
        row.querySelector('.sector-select').addEventListener('change', (e) => {
          sector.selected = e.target.checked;
          this.app.draw();
        });
      }
    });
  }

  deleteSector(sector) {
    const index = this.app.sectors.indexOf(sector);
    if (index > -1) {
      this.app.sectors.splice(index, 1);
      this.updateSectorList();
      this.app.draw();
    }
  }
}