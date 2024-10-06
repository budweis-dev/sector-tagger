import Sector from './Sector';

export default class CircleSector extends Sector {
  constructor({ id, name, color, centerX, centerY, radius, tags, inCart }) {
    super({ id, name, color, x: centerX - radius, y: centerY - radius, width: radius * 2, height: radius * 2, tags, inCart });
    this.centerX = centerX;
    this.centerY = centerY;
    this.radius = radius;
    this.type = 'circle';
  }

  drawFill(ctx, scale) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI);
    ctx.fill();
  }

  drawStroke(ctx, scale) {
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI);
    ctx.stroke();
  }

  containsPoint(x, y) {
    const dx = x - this.centerX;
    const dy = y - this.centerY;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }

  move(dx, dy) {
    this.centerX += dx;
    this.centerY += dy;
    this.x = this.centerX - this.radius;
    this.y = this.centerY - this.radius;
  }
}
