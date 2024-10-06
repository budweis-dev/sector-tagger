import Sector from './Sector';

export default class PolygonSector extends Sector {
  constructor({ id, name, color, points, tags, inCart }) {
    super({ id, name, color, tags, inCart });
    this.points = points.map(point => ({
      x: parseFloat(point.x),
      y: parseFloat(point.y),
    }));
    this.type = 'polygon';
  }

  draw(ctx, scale) {
    if (this.points.length < 3) return;

    ctx.fillStyle = this.adjustAlpha(this.color, 0.3);
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    this.points.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
    ctx.closePath();
    ctx.fill();

    if (this.selected) {
      this.drawSelection(ctx, scale);
    }

    if (this.hover) {
      ctx.strokeStyle = 'rgba(0, 0, 255, 1)';
      ctx.lineWidth = 3 / scale;
      ctx.beginPath();
      ctx.moveTo(this.points[0].x, this.points[0].y);
      this.points.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
      ctx.closePath();
      ctx.stroke();
    }
  }

  containsPoint(x, y) {
    let inside = false;
    const points = this.points;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const xi = points[i].x,
        yi = points[i].y;
      const xj = points[j].x,
        yj = points[j].y;

      const intersect =
        yi > y !== yj > y &&
        x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  drawSelection(ctx, scale) {
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
    ctx.lineWidth = 3 / scale;
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    this.points.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
    ctx.closePath();
    ctx.stroke();
  }

  move(dx, dy) {
    this.points = this.points.map(point => ({
      x: point.x + dx,
      y: point.y + dy
    }));
    this.x += dx;
    this.y += dy;
  }
}
