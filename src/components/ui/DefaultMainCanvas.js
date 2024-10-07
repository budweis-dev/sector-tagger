import UIComponent from './UIComponent';

export default class DefaultMainCanvas extends UIComponent {
  constructor(app) {
    super(app);
    this.render();
  }

  render() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'mainCanvas';
    this.canvas.width = this.app.container.clientWidth;
    this.canvas.height = this.app.container.clientHeight;
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.ctx = this.canvas.getContext('2d');
    this.app.container.appendChild(this.canvas);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawImage(image, x, y, scale) {
    this.ctx.drawImage(image, x, y, image.width * scale, image.height * scale);
  }

  drawSectors(sectors, originX, originY, scale) {
    sectors.forEach(sector => {
      this.ctx.save();
      this.ctx.translate(originX, originY);
      this.ctx.scale(scale, scale);
      sector.draw(this.ctx, scale);
      this.ctx.restore();
    });
  }
}