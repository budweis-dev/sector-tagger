# Sector Tagger

Sector Tagger is a canvas library for tagging sectors in an image. It supports rectangles, circles, and polygons.

WIP:
* bugfixes on polygon
* design improvements
* reusability
    * callbacks on all events
    * custom UI support (agnostic to the rest of the app)

TODO:
* add license
* better examples into readme
* add tests
* add documentation


## Usage - from npm

```bash
npm install sector-tagger
```

```js
import { SectorTaggerApp } from 'sector-tagger';

const container = document.getElementById('sector-tagger-app');
const app = new SectorTaggerApp(container, 'uniqueAppId');
```


## Usage - from a script tag

```html
<div id="sector-tagger-app" class="sector-tagger-container"></div>

<script src="dist/sector-tagger.js"></script>
<script>
  const container = document.getElementById('sector-tagger-app');
  const app = new SectorTagger.SectorTaggerApp(container, 'uniqueAppId');
</script>
```

## Usage - custom UI

1. Create custom UI components that extend the default ones.
```js
class CustomMainCanvas extends DefaultMainCanvas {
    constructor(app) {
        super(app);
    }
}
class CustomSectorDialog extends DefaultSectorDialog {
    constructor(app) {
        super(app);
    }
    render() {
        super.render();
        // your code here
    }
}
class CustomPanel extends DefaultRightPanel {
    constructor(app) {
        super(app);
    }
    render() {
        super.render();
        this.panel = document.querySelector('#custom-right-panel');
        this.panel.innerHTML = '<h1>Custom Right Panel</h1>';
        // your code here
    }
}
```
2. Prepare the container and add the custom UI components (directly into HTML or generate them in JS)
```html
<div id="sector-tagger-app" class="sector-tagger-container"></div>
<div id="custom-right-panel" class="right-panel"></div>
```

3. Pass them into the app.
```js
const container = document.getElementById('sector-tagger-app');
const app = new SectorTaggerApp(container, 'uniqueAppId', {
    mainCanvas: new CustomMainCanvas(app),
    overlayCanvas: new CustomOverlayCanvas(app),
    sectorDialog: new CustomSectorDialog(app),
    rightPanel: new CustomRightPanel(app),
});
```
