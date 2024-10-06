import Sector from './Sector';

export default class RectangleSector extends Sector {
  constructor(props) {
    super(props);
    this.type = 'rectangle';
  }

  drawFill(ctx, scale) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  drawStroke(ctx, scale) {
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }

  containsPoint(x, y) {
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y && y <= this.y + this.height;
  }

  move(dx, dy) {
    this.x += dx;
    this.y += dy;
  }
}
