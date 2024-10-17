document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('sectorTaggerApp');
  
  const config = {
    appId: 'uniqueAppId',
    fetchImgUrl: 'https://api.example.com/fetch-image',
    fetchSectorsUrl: 'https://api.example.com/fetch-sectors',
    onAddToCartCallback: (sector) => {
      console.log('Sector added to cart:', sector);
    },
    keyBindings: {
      toggleGrid: 'g',
      undo: 'z',
      redo: 'y',
      delete: 'Backspace',
      escape: 'Escape'
    },
    drawingModes: ['rectangle', 'circle', 'polygon', 'freehand'], // todo: add freehand after implementing touch support
    defaultDrawingMode: 'rectangle',
    uiComponents: {
      sectorDialog: new CustomSectorDialog()
    },
    customEventHandlers: {
      onKeyDown: (e, app) => {
        if (e.key === 'f') {
          app.toggleFullscreen();
        }
      }
    }
  };

  const app = new SectorTagger.SectorTaggerApp(container, config);

  // Example of using the public API
  app.api.setDrawingMode('circle');
  app.api.addSector({
    type: 'rectangle',
    x: 100,
    y: 100,
    width: 200,
    height: 150,
    color: '#ff0000',
    name: 'Custom Sector'
  });

  // Export data after 5 seconds - commented out for now because it's annoying during tests
  // setTimeout(() => {
  //   const data = app.exportData();
  //   console.log('Exported data:', data);
  // }, 5000);
});
