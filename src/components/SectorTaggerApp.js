import MainCanvas from './MainCanvas';
import OverlayCanvas from './OverlayCanvas';
import RectangleSector from '../shapes/RectangleSector';
import CircleSector from '../shapes/CircleSector';
import PolygonSector from '../shapes/PolygonSector';
import SectorDialog from './SectorDialog';
import RightPanel from './RightPanel';
import CoordinateTooltip from './CoordinateTooltip';
import DrawingShapeSelector from './DrawingShapeSelector.js';
import Sector from '../shapes/Sector';

export default class SectorTaggerApp {
  constructor(containerElement, appId, fetchImgUrl, fetchSectorsUrl, onAddToCartCallback) {
    this.container = containerElement;
    this.appId = appId;

    // State variables
    this.sectorRowMap = new Map();
    this.image = new Image();
    this.imageLoaded = false;
    this.scale = 1;
    this.originX = 0;
    this.originY = 0;
    this.startX = 0;
    this.startY = 0;
    this.isPanning = false;
    this.isSelecting = false;
    this.selectionStartX = 0;
    this.selectionStartY = 0;
    this.selectionRect = {};
    this.sectors = [];
    this.gridSettings = null;
    this.editingSector = null;
    this.isCtrlPressed = false;
    this.isHoveringOverSector = false;

    this.isDraggingSector = false;
    this.draggingSector = null;
    this.dragStartX = 0;
    this.dragStartY = 0;

    this.fetchImgUrl = fetchImgUrl;
    this.fetchSectorsUrl = fetchSectorsUrl;
    this.onAddToCartCallback = onAddToCartCallback;

    this.drawingMode = 'circle'; // 'rectangle', 'circle', 'polygon'
    this.isDrawingPolygon = false;
    this.polygonPoints = [];

    // Create canvas elements
    this.mainCanvas = new MainCanvas(this.container, this.container.clientWidth, this.container.clientHeight);
    this.overlayCanvas = new OverlayCanvas(this.container, this.container.clientWidth, this.container.clientHeight);

    // Create panel, dialog, tooltip, drawing shape selector
    this.sectorDialog = new SectorDialog(this);
    this.rightPanel = new RightPanel(this);
    this.sectorTable = this.rightPanel.sectorTable;
    this.coordinateTooltip = new CoordinateTooltip(this);
    this.drawingShapeSelector = new DrawingShapeSelector(this);

    // Initialize event listeners
    this.initEventListeners();
    this.initKeyboardShortcuts();
  }

  initEventListeners() {
    // Mouse events
    this.overlayCanvas.canvas.addEventListener('mousedown', e => this.onMouseDown(e));
    this.overlayCanvas.canvas.addEventListener('mousemove', e => this.onMouseMove(e));
    this.overlayCanvas.canvas.addEventListener('mouseup', e => this.onMouseUp(e));
    this.overlayCanvas.canvas.addEventListener('click', e => this.onClick(e));
    this.overlayCanvas.canvas.addEventListener('wheel', e => this.onWheel(e));

    // Keyboard events
    window.addEventListener('keydown', e => this.onKeyDown(e));
    window.addEventListener('keyup', e => this.onKeyUp(e));
  
  }

  initKeyboardShortcuts() {
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        this.sectorDialog.hide();
      }
    });
  }


  setDrawingMode(shape) {
    this.drawingMode = shape;
  }

  draw() {
    this.mainCanvas.clear();
    if (this.imageLoaded) {
      this.mainCanvas.drawImage(this.image, this.originX, this.originY, this.scale);
    }
    this.mainCanvas.drawSectors(this.sectors, this.originX, this.originY, this.scale);
    
    this.overlayCanvas.clear();
    this.overlayCanvas.drawCurrentShape(this);
    this.overlayCanvas.drawSectorHighlights(this.sectors, this.originX, this.originY, this.scale);
  }


  deleteSector(id) {
    // Remove the sector from the array
    this.sectors = this.sectors.filter((s) => s.id !== id);

    // Remove the row from the table
    const row = this.sectorRowMap.get(id);
    if (row) {
      row.remove();
      this.sectorRowMap.delete(id);
    }

    this.draw();
  }

  focusOnSector(sector) {
    // Calculate the scale to fit the sector into the canvas, with some padding
    const padding = 250; // pixels
    const canvasWidth = this.mainCanvas.canvas.width;
    const canvasHeight = this.mainCanvas.canvas.height;

    const scaleX = (canvasWidth - 2 * padding) / sector.width;
    const scaleY = (canvasHeight - 2 * padding) / sector.height;

    // Choose the smaller scale to ensure the sector fits
    const newScale = Math.min(scaleX, scaleY);

    // Limit the scale to a maximum and minimum value
    const minScale = 0.1;
    const maxScale = 10;
    this.scale = Math.min(Math.max(newScale, minScale), maxScale);

    // Calculate new origins to center the sector
    const sectorCenterX = sector.x + sector.width / 2;
    const sectorCenterY = sector.y + sector.height / 2;

    const canvasCenterX = this.mainCanvas.canvas.width / 2;
    const canvasCenterY = this.mainCanvas.canvas.height / 2;

    this.originX = canvasCenterX - LEFT_OFFSET - sectorCenterX * this.scale;
    this.originY = canvasCenterY - TOP_OFFSET - sectorCenterY * this.scale;

    // Redraw the canvas
    this.draw();
  }

  toggleGrid() {
    if (!this.imageLoaded) {
      alert('Please upload an image first.');
      return;
    }

    const cellWidth = parseFloat(this.gridCellWidthInput.value);
    const cellHeight = parseFloat(this.gridCellHeightInput.value);

    if (isNaN(cellWidth) || isNaN(cellHeight)) {
      alert('Cell width and height must be numbers.');
      return;
    }

    if (this.gridSettings && cellWidth == this.gridSettings.cellWidth && cellHeight == this.gridSettings.cellHeight) {
      this.gridSettings = null;
      this.draw();
      return;
    }

    if (cellWidth > 10 && cellHeight > 10) {
      this.gridSettings = { cellWidth, cellHeight };
      this.draw();
    } else {
      alert('Cell width and height must be greater than 10 for performance reasons.');
    }
  }

  handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.image = new Image();
        this.image.onload = () => {
          this.imageLoaded = true;
          this.originX = (this.mainCanvas.canvas.width - this.image.width * this.scale) / 2;
          this.originY = (this.mainCanvas.canvas.height - this.image.height * this.scale) / 2;
          this.draw();
        };
        this.image.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  handleJSONUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        // Clear existing sectors
        this.sectors = [];
        // Load sectors
        (data.sectors || []).forEach((sectorData) => {
          let sector;
          if (sectorData.type === 'rectangle') {
            sector = new RectangleSector(sectorData);
          } else if (sectorData.type === 'circle') {
            sector = new CircleSector(sectorData);
          } else if (sectorData.type === 'polygon') {
            sector = new PolygonSector(sectorData);
          }
          if (sector) {
            this.sectors.push(sector);
          }
        });

        this.rightPanel.updateSectorList();
        // Load grid settings
        this.gridSettings = data.gridSettings || null;
        if (this.gridSettings) {
          this.gridCellWidthInput.value = this.gridSettings.cellWidth;
          this.gridCellHeightInput.value = this.gridSettings.cellHeight;
        }

        this.draw();
      };
      reader.readAsText(file);
    }
  }

  exportData() {
    const data = {
      imageWidth: this.image ? this.image.width : 0,
      imageHeight: this.image ? this.image.height : 0,
      sectors: this.sectors,
      gridSettings: this.gridSettings,
    };

    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'sector_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }



  onMouseDown(e) {
    const rect = this.overlayCanvas.canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - this.originX) / this.scale;
    const mouseY = (e.clientY - rect.top - this.originY) / this.scale;

    if (e.ctrlKey && e.shiftKey && e.which === 1) {
      // Start dragging sector
      this.draggingSector = this.sectors.find(sector => sector.containsPoint(mouseX, mouseY));
      if (this.draggingSector) {
        this.isDraggingSector = true;
        this.dragStartX = mouseX - this.draggingSector.x;
        this.dragStartY = mouseY - this.draggingSector.y;
        this.updateCursor('move');
      }
    } else if (e.ctrlKey && e.which === 1) {
      if (this.drawingMode === 'rectangle' || this.drawingMode === 'circle') {
        this.isSelecting = true;
        this.selectionStartX = mouseX;
        this.selectionStartY = mouseY;
        this.selectionRect = {
          x: this.selectionStartX,
          y: this.selectionStartY,
          width: 0,
          height: 0,
        };
      } else if (this.drawingMode === 'polygon') {
        if (!this.isDrawingPolygon) {
          this.isDrawingPolygon = true;
          this.polygonPoints = [{ x: mouseX, y: mouseY }];
        } else {
          this.polygonPoints.push({ x: mouseX, y: mouseY });
        }
      }
    } else if (e.which === 1) {
      // Start panning
      this.isPanning = true;
      this.startX = e.clientX - this.originX;
      this.startY = e.clientY - this.originY;
      this.updateCursor('grabbing');
    }
  }

  onMouseMove(e) {
    const rect = this.overlayCanvas.canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - this.originX) / this.scale;
    const mouseY = (e.clientY - rect.top - this.originY) / this.scale;

    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;

    if (this.isDraggingSector) {
      // Update sector position
      this.draggingSector.move(mouseX - this.dragStartX - this.draggingSector.x, mouseY - this.dragStartY - this.draggingSector.y);
      this.dragStartX = mouseX - this.draggingSector.x;
      this.dragStartY = mouseY - this.draggingSector.y;
      this.draw();
    } else if (this.isSelecting) {
      const currentX = mouseX;
      const currentY = mouseY;
      this.selectionRect.width = currentX - this.selectionStartX;
      this.selectionRect.height = currentY - this.selectionStartY;
      this.draw();
    } else if (this.isDrawingPolygon && this.drawingMode === 'polygon') {
      this.draw();
    } else if (this.isPanning) {
      this.originX = e.clientX - this.startX;
      this.originY = e.clientY - this.startY;
      this.draw();
    } else {
      let hoveringOverSector = false;
      this.sectors.forEach((sector) => {
        if (sector.containsPoint(mouseX, mouseY)) {
          sector.hover = true;
          hoveringOverSector = true;

          let tooltipContent = `<strong>${sector.name}</strong><br>`;
          if (sector.tags.length > 0) {
            tooltipContent += 'Tags: ';
            sector.tags.forEach((tag) => {
              tooltipContent += `<span class="sector-tag">${tag}</span> `;
            });
          }

          this.coordinateTooltip.show(e.clientX, e.clientY, tooltipContent);
        } else {
          sector.hover = false;
        }
      });

      if (!hoveringOverSector) {
        this.coordinateTooltip.hide();
      }

      this.isHoveringOverSector = hoveringOverSector;
      this.updateCursor();
      this.draw();
    }
  }

  onMouseUp(e) {
    if (this.isDraggingSector) {
      this.isDraggingSector = false;
      this.draggingSector = null;
      this.updateCursor();
    }
    if (this.isSelecting) {
      this.isSelecting = false;
      this.createSector();
    }
    if (this.isDrawingPolygon && e.which === 3) {
      // Right-click to finish polygon
      this.isDrawingPolygon = false;

      const sector = new PolygonSector({
        name: `Sector ${this.sectors.length + 1}`,
        color: '#ffff0080',
        points: this.polygonPoints,
        tags: [],
      });
      this.sectors.push(sector);
      this.polygonPoints = [];
      this.draw();
    }

    this.isPanning = false;
    this.coordinateTooltip.hide();
    this.sectors.forEach((sector) => (sector.hover = false));
    this.draw();

  }

  createSector() {
    let newSector;
    if (this.drawingMode === 'rectangle') {
      newSector = new RectangleSector({
        id: Date.now(),
        name: `Sector ${this.sectors.length + 1}`,
        color: '#ffff0080',
        x: this.selectionRect.x,
        y: this.selectionRect.y,
        width: this.selectionRect.width,
        height: this.selectionRect.height,
        tags: [],
      });
    } else if (this.drawingMode === 'circle') {
      const radius = Math.sqrt(
        Math.pow(this.selectionRect.width, 2) + Math.pow(this.selectionRect.height, 2)
      );
      newSector = new CircleSector({
        id: Date.now(),
        name: `Sector ${this.sectors.length + 1}`,
        color: '#ffff0080',
        centerX: this.selectionStartX,
        centerY: this.selectionStartY,
        radius: radius,
        tags: [],
      });
    } else if (this.drawingMode === 'polygon') {
      newSector = new PolygonSector({
        id: Date.now(),
        name: `Sector ${this.sectors.length + 1}`,
        color: '#ffff0080',
        points: this.polygonPoints,
        tags: [],
      });
    }

    if (newSector) {
      this.sectors.push(newSector);
      this.rightPanel.updateSectorList();
      this.draw();
      this.editingSector = newSector;
      this.sectorDialog.open(newSector);
    }
  }


  onClick(e) {
    const rect = this.overlayCanvas.canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - this.originX) / this.scale;
    const mouseY = (e.clientY - rect.top - this.originY) / this.scale;

    const clickedSector = this.sectors.find(sector => sector.containsPoint(mouseX, mouseY));
    if (clickedSector) {
      clickedSector.onClick(e);
      this.editingSector = clickedSector;
      this.sectorDialog.open(clickedSector);
    }
  }


  onWheel(e) {
    e.preventDefault();
    const wheel = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = this.scale * wheel;

    if (newScale < 0.1 || newScale > 10) return;

    const rect = this.overlayCanvas.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    this.originX = mouseX - ((mouseX - this.originX) * (newScale / this.scale));
    this.originY = mouseY - ((mouseY - this.originY) * (newScale / this.scale));

    this.scale = newScale;
    this.draw();
  }

  updateCursor(cursorType = null) {
    if (cursorType) {

      this.container.style.cursor = cursorType;
    } else if (this.isDraggingSector) {
      this.container.style.cursor = 'move';
    } else if (this.isCtrlPressed) {
      this.container.style.cursor = 'crosshair';
    } else if (this.isHoveringOverSector) {
      this.container.style.cursor = 'pointer';
    } else {
      this.container.style.cursor = 'default';
    }
  }

  onKeyDown(e) {
    if (e.key === 'Control') {
      this.isCtrlPressed = true;
    }
  }

  onKeyUp(e) {
    if (e.key === 'Control') {
      this.isCtrlPressed = false;
    }
  }



  saveSectorDialog() {
    if (this.editingSector) {
      this.editingSector.name = this.sectorDialog.nameInput.value;
      this.editingSector.color = this.sectorDialog.colorInput.value + '80'; // Add transparency
      this.editingSector.tags = this.sectorDialog.tagsInput.value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      this.rightPanel.updateSectorList();
      this.draw();
    }
    this.sectorDialog.hide();
    this.editingSector = null;
  }

  cancelSectorDialog() {
    this.sectorDialog.hide();
  }


}