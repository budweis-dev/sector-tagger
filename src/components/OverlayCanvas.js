export default class OverlayCanvas {
  constructor(container, width, height) {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
    container.appendChild(this.canvas);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawCurrentShape(app) {
    if (app.isSelecting || app.isDrawingPolygon) {
      this.ctx.save();
      this.ctx.translate(app.originX, app.originY);
      this.ctx.scale(app.scale, app.scale);

      this.ctx.strokeStyle = 'rgba(0, 255, 0, 1)';
      this.ctx.lineWidth = 1 / app.scale;

      if (app.drawingMode === 'rectangle' && app.isSelecting) {
        this.ctx.strokeRect(
          app.selectionRect.x,
          app.selectionRect.y,
          app.selectionRect.width,
          app.selectionRect.height
        );
      } else if (app.drawingMode === 'circle' && app.isSelecting) {
        const radius = Math.sqrt(
          Math.pow(app.selectionRect.width, 2) + Math.pow(app.selectionRect.height, 2)
        );
        this.ctx.beginPath();
        this.ctx.arc(
          app.selectionStartX,
          app.selectionStartY,
          radius,
          0,
          2 * Math.PI
        );
        this.ctx.stroke();
      } else if (app.drawingMode === 'polygon' && app.isDrawingPolygon) {
        if (app.polygonPoints.length > 0) {
          this.ctx.beginPath();
          this.ctx.moveTo(app.polygonPoints[0].x, app.polygonPoints[0].y);
          app.polygonPoints.slice(1).forEach(point => {
            this.ctx.lineTo(point.x, point.y);
          });
          if (app.polygonPoints.length > 1) {
            this.ctx.lineTo(
              (app.lastMouseX - app.originX) / app.scale,
              (app.lastMouseY - app.originY) / app.scale
            );
          }
          this.ctx.stroke();
        }
      }
      this.ctx.restore();
    }
  }

  drawSectorHighlights(sectors, originX, originY, scale) {
    sectors.forEach(sector => {
      if (sector.hover || sector.selected) {
        this.ctx.save();
        this.ctx.translate(originX, originY);
        this.ctx.scale(scale, scale);
        this.ctx.strokeStyle = sector.hover ? 'yellow' : 'red';
        this.ctx.lineWidth = 2 / scale;
        sector.drawStroke(this.ctx, scale);
        this.ctx.restore();
      }
    });
  }
}