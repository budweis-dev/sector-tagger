class CustomSectorDialog {
    constructor(app) {
      this.app = app;
      this.render();
      this.addEventListeners();
    }

    render() {
      this.dialog = document.getElementById('customSectorDialog');
    }

    addEventListeners() {
      document.getElementById('dialogSaveSectorButton').addEventListener('click', () => this.saveSector());
      document.getElementById('dialogCancelButton').addEventListener('click', () => this.close());
    }

    open(sector) {
      console.log('open dialog', sector);
      this.editingSector = sector || null;
      const title = document.getElementById('sectorDialogTitle');
      const nameInput = document.getElementById('dialogSectorName');
      const tagsInput = document.getElementById('dialogSectorTags');
      const sectorMetadata = document.getElementById('sectorMetadata');

      if (sector) {
        title.textContent = 'Edit Sector';
        nameInput.value = sector.name;
        tagsInput.value = sector.tags.join(', ');
        // add metadata to sectorMetadata div if it exists
        if (sector.metadata) {
          sectorMetadata.innerHTML = sector.metadata.map(meta => `<div>${meta.key}: ${meta.value}</div>`).join('');
        }
      } else {
        title.textContent = 'Add Sector';
        nameInput.value = '';
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
      const name = document.getElementById('dialogSectorName').value;
      const tags = document.getElementById('dialogSectorTags').value
        .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

      if (this.editingSector) {
        this.editingSector.name = name;
        //fixed color - transparent yellow
        this.editingSector.color = '#ffff0080';
        this.editingSector.tags = tags;
      } else {
        // TODO: handle or dropthis case?
        console.log('this should never happen');
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
    }
  }