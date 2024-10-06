import { adjustAlpha } from '../helpers/utils';

export default class Sector {
    constructor({ type, id, name, color, x, y, width, height, tags, inCart }) {
      this.type = type;
      this.id = id;
      this.name = name;
      this.color = color;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.tags = tags || [];
      this.inCart = inCart || false;
      this.hover = false;
      this.selected = false;
    }
  
    draw(ctx, scale) {
      this.drawFill(ctx, scale);
      this.drawStroke(ctx, scale);
    }
  
    drawFill(ctx, scale) {
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  
    drawStroke(ctx, scale) {
      ctx.stroke();
    }
  
    containsPoint(x, y) {
      // Implement point containment check
    }
  
    adjustAlpha(color, alpha) {
        adjustAlpha(color, alpha);
    }

    onClick(e) {
        console.log('Sector clicked');
    }

  }