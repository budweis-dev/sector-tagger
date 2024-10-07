import UIComponent from './UIComponent';

export default class DefaultCoordinateTooltip extends UIComponent {
  constructor(app) {
    super(app);
    this.render();
  }

  render() {
    this.tooltip = document.createElement('div');
    this.tooltip.style.position = 'absolute';
    this.tooltip.style.display = 'none';
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