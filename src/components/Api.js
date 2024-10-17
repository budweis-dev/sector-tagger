export default class SectorTaggerApi {
    constructor(app) {
        this.app = app;
    }

    // Public API methods
    addSector(sectorData) {
        this.app.createSector(sectorData);
    }

    removeSector(sectorId) {
        this.app.deleteSector(sectorId);
    }

    getSectors() {
        return this.app.sectors;
    }

    setDrawingMode(mode) {
        this.app.drawingMode = mode;
    }

    zoomIn() {
        // todo: implement zoom in calling
    }

    zoomOut() {
        // Logic to zoom out
    }

    undo() {
        // Implement undo functionality
    }

    redo() {
        // Implement redo functionality
    }

    exportData() {
        // ... existing export logic
    }

    importData(data) {
        // Logic to import data
    }


}