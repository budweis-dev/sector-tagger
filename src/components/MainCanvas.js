export default class MainCanvas {
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

  drawSectors(sectors, originX, originY, scale) {
    sectors.forEach(sector => {
      this.ctx.save();
      this.ctx.translate(originX, originY);
      this.ctx.scale(scale, scale);
      sector.draw(this.ctx, scale);
      this.ctx.restore();
    });
  }

  drawImage(image, originX, originY, scale) {
    this.ctx.drawImage(image, originX, originY, image.width * scale, image.height * scale);
  }
}