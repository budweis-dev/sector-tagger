import UIComponent from './UIComponent';

export default class DefaultSectorDialog extends UIComponent {
  constructor(app) {
    super(app);
    this.render();
    this.addEventListeners();
  }

  render() {
    this.dialog = document.createElement('div');
    this.dialog.id = 'sector-dialog';
    this.dialog.innerHTML = `
      <div id="sector-dialog-title">Add/Edit Sector</div>
      <form id="sector-dialog-form">
        <div>
          <label>Name: </label>
          <input type="text" id="dialog-sector-name">
        </div>
        <div>
          <label>Color: </label>
          <input type="color" id="dialog-sector-color" value="#ffff00">
        </div>
        <div>
          <label>Tags: </label>
          <input type="text" id="dialog-sector-tags" placeholder="Comma-separated">
        </div>
        <hr>
        <div>
          <button type="button" id="dialog-cancel-button">Cancel</button>
          <button type="button" id="dialog-save-sector-button">Save Sector</button>
        </div>
      </form>
    `;
    document.body.appendChild(this.dialog);
    this.dialog.style.display = 'none';
  }

  addEventListeners() {
    document.getElementById('dialog-save-sector-button').addEventListener('click', () => this.saveSector());
    document.getElementById('dialog-cancel-button').addEventListener('click', () => this.close());
  }

  open(sector) {
    this.editingSector = sector || null;
    const title = document.getElementById('sector-dialog-title');
    const nameInput = document.getElementById('dialog-sector-name');
    const colorInput = document.getElementById('dialog-sector-color');
    const tagsInput = document.getElementById('dialog-sector-tags');

    if (sector) {
      title.textContent = 'Edit Sector';
      nameInput.value = sector.name;
      colorInput.value = sector.color.slice(0, 7);
      tagsInput.value = sector.tags.join(', ');
    } else {
      title.textContent = 'Add Sector';
      nameInput.value = '';
      colorInput.value = '#ffff00';
      tagsInput.value = '';
    }
    this.dialog.style.display = 'block';
  }

  close() {
    this.dialog.style.display = 'none';
  }

  hide() {
    this.close();
  }

  saveSector() {
    const name = document.getElementById('dialog-sector-name').value;
    const color = document.getElementById('dialog-sector-color').value + '80';
    const tags = document.getElementById('dialog-sector-tags').value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (this.editingSector) {
      this.editingSector.name = name;
      this.editingSector.color = color;
      this.editingSector.tags = tags;
    } else {
      const newSector = new Rectangle({
        name,
        color,
        x: this.app.selectionRect.x,
        y: this.app.selectionRect.y,
        width: this.app.selectionRect.width,
        height: this.app.selectionRect.height,
        tags,
      });
      this.app.sectors.push(newSector);
    }
    this.close();
    this.app.draw();
    this.app.ui.rightPanel.updateSectorList();
    console.log(this.app.sectors);
  }
}