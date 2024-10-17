import DefaultMainCanvas from './ui/DefaultMainCanvas';
import DefaultOverlayCanvas from './ui/DefaultOverlayCanvas';
import DefaultSectorDialog from './ui/DefaultSectorDialog';
import DefaultRightPanel from './ui/DefaultRightPanel';
import DefaultCoordinateTooltip from './ui/DefaultCoordinateTooltip';
import DefaultDrawingShapeSelector from './ui/DefaultDrawingShapeSelector';
import RectangleSector from '../shapes/RectangleSector';
import CircleSector from '../shapes/CircleSector';
import PolygonSector from '../shapes/PolygonSector';
import SectorTaggerApi from './Api';
import SectorFactory from '../helpers/SectorFactory';

export default class SectorTaggerApp {
  constructor(containerElement, config = {}) {
    this.container = containerElement;

    this.sectorFactory = new SectorFactory(this);
    this.config = this.mergeConfig(config);
    this.api = new SectorTaggerApi(this);

    this.initState();
    this.initUI();
    this.initEventListeners();
    this.initKeyboardShortcuts();
  }

  mergeConfig(config) {
    const defaultConfig = {
      appId: 'defaultAppId',
      fetchImgUrl: null,
      fetchSectorsUrl: null,
      onAddToCartCallback: null,
      macCtrlReplace: true, //todo: make it work :D
      keyBindings: {
        toggleGrid: 'g',
        undo: 'z',
        redo: 'y',
        delete: 'Delete',
        escape: 'Escape',
        ctrl: 'Control',
        fullscreen: 'F11',
        save: 'Enter',
        cancel: 'Escape',
        add: 'Enter',
        drawingShapeSelector: 's',
        move: 'Space',
        zoomIn: 'ArrowUp',
        zoomOut: 'ArrowDown',
        pan: 'p',
        zoomReset: 'r'
      },
      drawingModes: ['rectangle', 'circle', 'polygon'],
      defaultDrawingMode: 'rectangle',
      gridSettings: null,
      uiComponents: {},
      customEventHandlers: {}
    };

    return { ...defaultConfig, ...config };
  }

  initState() {
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
    this.gridSettings = this.config.gridSettings || null;
    this.editingSector = null;
    this.isCtrlPressed = false;
    this.isHoveringOverSector = false;

    this.isDraggingSector = false;
    this.draggingSector = null;
    this.dragStartX = 0;
    this.dragStartY = 0;

    this.drawingMode = 'circle';
    this.isDrawingPolygon = false;
    this.polygonPoints = [];
  }

  initUI() {
    this.ui = {
      mainCanvas: this.config.uiComponents.mainCanvas || new DefaultMainCanvas(this),
      overlayCanvas: this.config.uiComponents.overlayCanvas || new DefaultOverlayCanvas(this),
      sectorDialog: this.config.uiComponents.sectorDialog || new DefaultSectorDialog(this),
      rightPanel: this.config.uiComponents.rightPanel || new DefaultRightPanel(this),
      coordinateTooltip: this.config.uiComponents.coordinateTooltip || new DefaultCoordinateTooltip(this),
      drawingShapeSelector: this.config.uiComponents.drawingShapeSelector || new DefaultDrawingShapeSelector(this)
    };
  }

  initEventListeners() {
    this.ui.overlayCanvas.addMouseListeners({
      onMouseDown: this.onMouseDown.bind(this),
      onMouseMove: this.onMouseMove.bind(this),
      onMouseUp: this.onMouseUp.bind(this),
      onClick: this.onClick.bind(this),
      onWheel: this.onWheel.bind(this)
    });
  }

  initKeyboardShortcuts() {

    document.addEventListener('keyup', e => {
      if (this.config.macCtrlReplace && e.metaKey) {
        this.isCtrlPressed = false;
      } else if (e.key === this.config.keyBindings.ctrl) {
        this.isCtrlPressed = false;
      }

      if (this.config.customEventHandlers.onKeyUp) {
        this.config.customEventHandlers.onKeyUp(e, this);
      }
    });


    document.addEventListener('keydown', e => {
      if (this.config.macCtrlReplace && e.metaKey) {
        this.isCtrlPressed = true;
      } else if (e.key === this.config.keyBindings.ctrl) {
        this.isCtrlPressed = true;
      }

      if (this.config.customEventHandlers.onKeyDown) {
        this.config.customEventHandlers.onKeyDown(e, this);
      } else if (e.key === this.config.keyBindings.escape) {
        this.ui.sectorDialog.hide();
      }

      if (e.key === this.config.keyBindings.undo) {
        this.api.undo();
      }
      if (e.key === this.config.keyBindings.redo) {
        this.api.redo();
      }
      if (e.key === this.config.keyBindings.delete) {
        this.api.deleteSector(this.editingSector.id);
      }
      if (e.key === this.config.keyBindings.toggleGrid) {
        this.api.toggleGrid();
      }
      if (e.key === this.config.keyBindings.fullscreen) {
        this.api.toggleFullscreen();
      }
      if (e.key === this.config.keyBindings.save) {
        this.saveSectorDialog();
      }
      if (e.key === this.config.keyBindings.cancel) {
        this.api.cancelSectorDialog();
      }
      if (e.key === this.config.keyBindings.add) {
        this.api.createSector();
      }
      if (e.key === this.config.keyBindings.drawingShapeSelector) {
        this.setDrawingMode(e.key);
      }

    });
  }

  setDrawingMode(shape) {
    this.drawingMode = shape;
  }

  draw() {
    this.ui.mainCanvas.clear();
    if (this.imageLoaded) {
      this.ui.mainCanvas.drawImage(this.image, this.originX, this.originY, this.scale);
    }
    this.ui.mainCanvas.drawSectors(this.sectors, this.originX, this.originY, this.scale);

    this.ui.overlayCanvas.clear();
    this.ui.overlayCanvas.drawCurrentShape(this);
    this.ui.overlayCanvas.drawSectorHighlights(this.sectors, this.originX, this.originY, this.scale);
  }

  deleteSector(id) {
    this.sectors = this.sectors.filter((s) => s.id !== id);
    this.ui.rightPanel.removeSectorRow(id);
    this.draw();
  }

  focusOnSector(sector) {
    // Calculate the scale to fit the sector into the canvas, with some padding
    const padding = 250; // pixels
    const canvasWidth = this.ui.mainCanvas.canvas.width;
    const canvasHeight = this.ui.mainCanvas.canvas.height;

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

    const canvasCenterX = this.ui.mainCanvas.canvas.width / 2;
    const canvasCenterY = this.ui.mainCanvas.canvas.height / 2;

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
          this.originX = (this.ui.mainCanvas.canvas.width - this.image.width * this.scale) / 2;
          this.originY = (this.ui.mainCanvas.canvas.height - this.image.height * this.scale) / 2;
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

        this.ui.rightPanel.updateSectorList();
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
    const blob = new Blob([dataStr], { type: 'application/json' });
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
    const rect = this.ui.overlayCanvas.canvas.getBoundingClientRect();
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
    const rect = this.ui.overlayCanvas.canvas.getBoundingClientRect();
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

          this.ui.coordinateTooltip.show(e.clientX, e.clientY, tooltipContent);
        } else {
          sector.hover = false;
        }
      });

      if (!hoveringOverSector) {
        this.ui.coordinateTooltip.hide();
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
    this.ui.coordinateTooltip.hide();
    this.sectors.forEach((sector) => (sector.hover = false));
    this.draw();

  }

  createSector(sectorData = null) {
    let newSector;
    if (sectorData != null) {
      newSector = this.sectorFactory.createSector(sectorData);
    } else {
      if (this.drawingMode === 'rectangle') {
        newSector = this.sectorFactory.createSector({
          type: 'rectangle',
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
        newSector = this.sectorFactory.createSector({
          type: 'circle',
          id: Date.now(),
          name: `Sector ${this.sectors.length + 1}`,
          color: '#ffff0080',
          centerX: this.selectionStartX,
          centerY: this.selectionStartY,
          radius: radius,
          tags: [],
        });
      } else if (this.drawingMode === 'polygon') {
        newSector = this.sectorFactory.createSector({
          type: 'polygon',
          id: Date.now(),
          name: `Sector ${this.sectors.length + 1}`,
          color: '#ffff0080',
          points: this.polygonPoints,
          tags: [],
        });
      }
    }

    if (newSector) {
      this.sectors.push(newSector);
      this.ui.rightPanel.updateSectorList();
      this.draw();
      this.editingSector = newSector;
      this.ui.sectorDialog.open(newSector);
    }
  }

  onClick(e) {
    const rect = this.ui.overlayCanvas.canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - this.originX) / this.scale;
    const mouseY = (e.clientY - rect.top - this.originY) / this.scale;

    const clickedSector = this.sectors.find(sector => sector.containsPoint(mouseX, mouseY));
    if (clickedSector) {
      clickedSector.onClick(e);
      this.editingSector = clickedSector;
      this.ui.sectorDialog.open(clickedSector);
    }
  }

  onWheel(e) {
    e.preventDefault();
    const wheel = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = this.scale * wheel;

    if (newScale < 0.1 || newScale > 10) return;

    const rect = this.ui.overlayCanvas.canvas.getBoundingClientRect();
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


  onKeyUp(e) {
    if (e.key === 'Control') {
      this.isCtrlPressed = false;
    }
  }

  saveSectorDialog() {
    if (this.editingSector) {
      this.editingSector.name = this.ui.sectorDialog.nameInput.value;
      this.editingSector.color = this.ui.sectorDialog.colorInput.value + '80'; // Add transparency
      this.editingSector.tags = this.ui.sectorDialog.tagsInput.value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      this.ui.rightPanel.updateSectorList();
      this.draw();
    }
    this.ui.sectorDialog.hide();
    this.editingSector = null;
  }
  cancelSectorDialog() {
    this.ui.sectorDialog.hide();
  }
}
