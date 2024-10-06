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
