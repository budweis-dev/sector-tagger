export default class CoordinateTooltip {
  constructor(app) {
    this.app = app;
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'coordinate-tooltip';
    this.tooltip.style.position = 'absolute';
    this.tooltip.style.display = 'none';
    this.tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    this.tooltip.style.color = 'white';
    this.tooltip.style.padding = '5px';
    this.tooltip.style.borderRadius = '3px';
    this.tooltip.style.zIndex = '1000';
    this.app.container.appendChild(this.tooltip);
  }

  show(x, y, content) {
    this.tooltip.style.left = `${x}px`;
    this.tooltip.style.top = `${y}px`;
    this.tooltip.innerHTML = content;
    this.tooltip.style.display = 'block';
  }

  hide() {
    this.tooltip.style.display = 'none';
  }
}