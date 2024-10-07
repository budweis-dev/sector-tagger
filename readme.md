# Sector Tagger

SectorTagger is a powerful native JavaScript library for loading, drawing, moving and tagging sectors(areas) in images (or empty background) using HTML5 Canvas. 

It supports drawing rectangles, circles, and polygons with an intuitive user interface.
________

![Sector Tagger Demo](link_to_demo_gif.gif) (TODO - record a GIF :)



## Features

- Draw and edit rectangles, circles, and polygons
- Zoom and pan functionality
- Add tags, color and comments to sectors
- Hovering over sectors highlights them
- Filter sectors by tags
- Export and import data in JSON format
- Fully customizable UI components
- Responsive design (non-mobile friendly yet)

## Installation

```bash
npm install sector-tagger
```

## Quick Start
### Usage with npm
```javascript
import { SectorTaggerApp } from 'sector-tagger';

const container = document.getElementById('sector-tagger-app');
const app = new SectorTaggerApp(container, 'uniqueAppId');
```

### Usage with script tag
```html
<div id="sector-tagger-app" class="sector-tagger-container"></div>

<script src="dist/sector-tagger.js"></script>
<script>
  const container = document.getElementById('sector-tagger-app');
  const app = new SectorTagger.SectorTaggerApp(container, 'uniqueAppId');
</script>
```

## API Documentation

### SectorTaggerApp
The main class that initializes the Sector Tagger application.

```javascript
const app = new SectorTaggerApp(containerElement, appId, fetchImgUrl, fetchSectorsUrl, onAddToCartCallback, uiComponents);
```

Parameters:
- `containerElement`: DOM element to contain the Sector Tagger app
- `appId`: Unique identifier for the app instance
- `fetchImgUrl`: URL to fetch the image (optional)
- `fetchSectorsUrl`: URL to fetch existing sectors (optional)
- `onAddToCartCallback`: Callback function when adding sectors to cart (optional)
- `uiComponents`: Custom UI components (optional)

### Methods
- `setDrawingMode(shape: string)`: Set the current drawing mode ('rectangle', 'circle', or 'polygon')
- `draw()`: Redraw the canvas
- `deleteSector(id: string)`: Delete a sector by its ID
- `focusOnSector(sector: Sector)`: Focus the view on a specific sector
- `toggleGrid()`: Toggle the grid overlay
- `handleImageUpload(event: Event)`: Handle image upload
- `handleJSONUpload(event: Event)`: Handle JSON data upload
- `exportData()`: Export sector data as JSON


## Sector Types
Sector Tagger supports three types of sectors:

1. Rectangle Sector
2. Circle Sector
3. Polygon Sector (Buggy and not fully tested)

Each sector type has its own class with specific methods for drawing and interaction.

### Common Sector Methods
- `draw(ctx: CanvasRenderingContext2D, scale: number)`: Draw the sector on the canvas
- `containsPoint(x: number, y: number): boolean`: Check if a point is inside the sector
- `move(dx: number, dy: number)`: Move the sector by a given offset

## Events
Sector Tagger provides various events that you can listen to and customize:

- Mouse events (mousedown, mousemove, mouseup, click, wheel)
- Keyboard events (keydown, keyup)

You can customize these events by extending the default UI components and overriding their methods.

## Styling
Sector Tagger comes with default styles, but you can easily customize them to match your application's design. 

## Customization examples:
### Prepare custom canvas and panel

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sector Tagger Demo</title>
  <style>
    .sector-tagger-container {
      width: 800px;
      height: 600px;
      border: 1px solid #ccc;
    }
  </style>
</head>
<body>
  <div id="sector-tagger-app" class="sector-tagger-container"></div>
  <div id="custom-right-panel">
    <div id="custom-right-panel-content">
      <!-- custom content here -->
    </div>
  </div>

  <script src="dist/sector-tagger.js"></script>
  <script>
    class CustomRightPanel extends DefaultRightPanel {
      constructor(app) {
        super(app);
      }

      // required todo: implement remaining methods of interface UIComponent

      render() {
        super.render();
        this.panel = document.querySelector('#custom-right-panel');
        // custom content here
      }

      updateSectorList() {
        // custom implementation
      }

      deleteSector() {
        // custom implementation
      }
    }

    const container = document.getElementById('sector-tagger-app');
    const app = new SectorTaggerApp(container, 'uniqueAppId', null, null, null, {
      rightPanel: new CustomRightPanel(app),
    });
  </script>
</body>
</html>
```

## Customization:
### Custom Right Panel

```javascript
class CustomRightPanel extends DefaultRightPanel {
  constructor(app) {
    super(app);
  }

  render() {
    super.render();
    this.panel = document.querySelector('#custom-right-panel');
    // Add your custom content here
  }
}

const app = new SectorTaggerApp(container, 'uniqueAppId', null, null, null, {
  rightPanel: new CustomRightPanel(app),
});
```


<!-- ## Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/your-username/sector-tagger/issues) or join our [Discord community](link_to_discord).

--- -->

### Notes:

#### WIP:
* bugfixes on polygon
* design improvements
* complete readme
* reusability
    * callbacks on all events
    * custom UI support (agnostic to the rest of the app)

#### TODO:
* add license 
* better examples into readme
* add tests

---
My name is Aleš and I'm a software developer from Czech Republic. 
I needed this library for one of my projects and I decided to share it with the community to contributte into open source and also improve my JS+NPM skills.

### Testing and contribution is welcome!

