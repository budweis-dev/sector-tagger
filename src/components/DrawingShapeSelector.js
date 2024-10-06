export default class DrawingShapeSelector {
    constructor(app) {
        this.app = app;
        this.shapeSelector = null;
        this.createShapeSelector();
        this.addEventListeners();
    }

    createShapeSelector() {
        const shapeSelector = document.createElement('div');
        shapeSelector.classList.add('shape-selector');
        shapeSelector.style.position = 'absolute';
        shapeSelector.style.top = '10px';
        shapeSelector.style.left = '10px';
        shapeSelector.style.zIndex = '1000';
        shapeSelector.style.background = 'rgba(0, 0, 0, 0.5)';
        shapeSelector.style.border = '1px solid #000';
        shapeSelector.style.borderRadius = '5px';
        shapeSelector.style.padding = '5px';
        shapeSelector.innerHTML = `
            <button id="rectangle-button" title="Rectangle" data-shape="rectangle">
                <i class="i-square"></i> Rectangle
            </button>
            <button id="circle-button" title="Circle" data-shape="circle">
                <i class="i-circle"></i> Circle
            </button>
            <button id="polygon-button" title="Polygon" data-shape="polygon">
                <i class="i-polygon"></i> Polygon
            </button>
        `;
        this.app.container.appendChild(shapeSelector);
        this.shapeSelector = shapeSelector;
    }

    addEventListeners() {
        const buttons = this.shapeSelector.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                this.selectShape(button.dataset.shape);
            });
        });
    }

    selectShape(shape) {
        this.app.setDrawingMode(shape);
    }

    show() {
        this.shapeSelector.style.display = 'block';
    }

    hide() {
        this.shapeSelector.style.display = 'none';
    }

}