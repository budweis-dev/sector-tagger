<!-- src/App.svelte -->
<script lang="ts" context="module">
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { Stage } from 'svelte-konva';
  import { Sector } from '../../src';
  import { fetchSectors } from '../../src';
  import type { SectorData } from '../../src';
  import type { KonvaEventObject, Node } from 'konva';
  import type { NodeConfig } from 'konva/lib/Node';

  export let stageWidth = 800;
  export let stageHeight = 600;
  export let selectedSectorId: number | null = null;
  export let hoveredSectorId: number | null = null;

  export let sectors: SectorData[] = [
    {
      id: 1,
      name: 'Example Page',
      x: 50,
      y: 50,
      width: 700,
      height: 500,
      level: 'page',
      parentId: null,
      customData: {
        description: 'This is a custom description for the page',
        metadata: {
          createdAt: new Date().toISOString(),
          author: 'Example User'
        }
      }
    },
    {
      id: 2,
      name: 'Example View',
      x: 100,
      y: 100,
      width: 600,
      height: 400,
      level: 'view',
      parentId: 1,
      customData: {
        description: 'This is a custom description for the view',
        metadata: {
          createdAt: new Date().toISOString(),
          author: 'Example User'
        }
      }
    },
    {
      id: 3,
      name: 'Example Sector',
      x: 150,
      y: 150,
      width: 200,
      height: 150,
      level: 'sector',
      parentId: 2,
      customData: {
        description: 'This is a custom description for the sector',
        metadata: {
          createdAt: new Date().toISOString(),
          author: 'Example User'
        }
      }
    }
  ];

  onMount(() => {
    fetchSectors();
  });

  function handleClick(sector: SectorData, detail: KonvaEventObject<MouseEvent>) {
    selectedSectorId = sector.id;
  }

  function handleHover(sector: SectorData, detail: KonvaEventObject<MouseEvent>) {
    hoveredSectorId = sector.id;
  }

  function handleTransform(sector: SectorData, detail: any) {
    const idx = sectors.findIndex(s => s.id === sector.id);
    if (idx !== -1) {
      sectors[idx] = { ...sector, ...detail };
      sectors = sectors;
    }
  }

  function addSector(level: 'page' | 'view' | 'sector' = 'sector') {
    const newId = Math.max(...sectors.map(s => s.id)) + 1;
    const parentBounds = level === 'sector' 
      ? sectors.find(s => s.level === 'view') 
      : level === 'view' 
        ? sectors.find(s => s.level === 'page')
        : undefined;

    const defaultSize = level === 'page' ? 700 : level === 'view' ? 600 : 200;
    const padding = level === 'page' ? 50 : level === 'view' ? 100 : 150;

    let x = padding;
    let y = padding;
    let width = defaultSize;
    let height = defaultSize * 0.75;

    if (parentBounds) {
      x = parentBounds.x + 50;
      y = parentBounds.y + 50;
      width = Math.min(defaultSize, parentBounds.width - 100);
      height = Math.min(defaultSize * 0.75, parentBounds.height - 100);
    }

    sectors = [...sectors, {
      id: newId,
      name: `Example ${level.charAt(0).toUpperCase() + level.slice(1)} ${newId}`,
      x,
      y,
      width,
      height,
      level,
      parentId: level === 'sector' ? 2 : level === 'view' ? 1 : null,
      customData: {
        description: `This is a custom description for the ${level}`,
        metadata: {
          createdAt: new Date().toISOString(),
          author: 'Example User'
        }
      }
    }];
  }

  function removeSector(id: number) {
    const sectorToRemove = sectors.find(s => s.id === id);
    if (!sectorToRemove) return;

    // Remove all child sectors first
    if (sectorToRemove.level === 'page') {
      sectors = sectors.filter(s => s.level === 'page' && s.id !== id);
    } else if (sectorToRemove.level === 'view') {
      sectors = sectors.filter(s => s.level === 'page' || (s.level === 'view' && s.id !== id));
    } else {
      sectors = sectors.filter(s => s.id !== id);
    }

    if (selectedSectorId === id) {
      selectedSectorId = null;
    }
  }

  function getParentBounds(sector: SectorData): { x: number; y: number; width: number; height: number } {
    if (sector.level === 'page') {
      return { x: 0, y: 0, width: stageWidth, height: stageHeight };
    } else if (sector.level === 'view') {
      const page = sectors.find(s => s.level === 'page');
      return page || { x: 0, y: 0, width: stageWidth, height: stageHeight };
    } else {
      const view = sectors.find(s => s.level === 'view');
      return view || { x: 0, y: 0, width: stageWidth, height: stageHeight };
    }
  }

  let draggingPanel: HTMLElement | null = null;
  let offsetX = 0;
  let offsetY = 0;

  function handleDragStart(e: DragEvent) {
    if (!(e.target instanceof HTMLElement)) return;
    const panel = e.target.closest('.panel');
    if (!panel || !(panel instanceof HTMLElement)) return;
    
    draggingPanel = panel;
    const rect = panel.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    
    // Vytvoříme průhledný obrázek pro drag ghost
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer?.setDragImage(img, 0, 0);
    
    panel.style.opacity = '0.7';
  }

  function handleDrag(e: DragEvent) {
    if (!draggingPanel || !e.clientX || !e.clientY) return;
    
    draggingPanel.style.left = `${e.clientX - offsetX}px`;
    draggingPanel.style.top = `${e.clientY - offsetY}px`;
  }

  function handleDragEnd(e: DragEvent) {
    if (!draggingPanel) return;
    draggingPanel.style.opacity = '1';
    draggingPanel = null;
  }

  onMount(() => {
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => e.preventDefault());
    
    const panels = document.querySelectorAll('.panel');
    panels.forEach(panel => {
      panel.addEventListener('dragstart', handleDragStart);
      panel.addEventListener('drag', handleDrag);
      panel.addEventListener('dragend', handleDragEnd);
    });
  });
</script>

<main>
  <div class="stage-container">
    <Stage config={{ width: stageWidth, height: stageHeight }}>
      {#each sectors as sector (sector.id)}
        <Sector
          {...sector}
          color={sector.level === 'page' ? '#00000020' : 
                 sector.level === 'view' ? '#0000ff20' : 
                 '#ff000020'}
          isSelected={selectedSectorId === sector.id}
          isHovering={hoveredSectorId === sector.id}
          onClick={e => handleClick(sector, e)}
          onHover={e => handleHover(sector, e)}
          onTransform={transform => handleTransform(sector, transform)}
          parentBounds={getParentBounds(sector)}
        />
      {/each}
    </Stage>
  </div>

  <div class="panel controls" draggable="true">
    <div class="panel-header">Controls</div>
    <div class="panel-content">
      <div class="add-buttons">
        <button on:click={() => addSector('page')} class="page">Add Page</button>
        <button on:click={() => addSector('view')} class="view">Add View</button>
        <button on:click={() => addSector('sector')} class="sector">Add Sector</button>
      </div>
      {#if selectedSectorId !== null}
        <button on:click={() => selectedSectorId && removeSector(selectedSectorId)} class="delete">
          Remove Selected
        </button>
      {/if}
    </div>
  </div>

  {#if selectedSectorId !== null}
    <div class="panel info selected-info" draggable="true">
      <div class="panel-header">Selected Element Info</div>
      <div class="panel-content">
        {#if sectors}
          {#each sectors.filter(s => s.id === selectedSectorId) as sector}
            <p><strong>Type:</strong> {sector.level}</p>
            <p><strong>Name:</strong> {sector.name}</p>
            <p><strong>Position:</strong> ({sector.x.toFixed(0)}, {sector.y.toFixed(0)})</p>
            <p><strong>Size:</strong> {sector.width.toFixed(0)} × {sector.height.toFixed(0)}</p>
            <p><strong>Description:</strong> {sector.customData.description}</p>
            <p><strong>Created At:</strong> {sector.customData.metadata.createdAt}</p>
            <p><strong>Author:</strong> {sector.customData.metadata.author}</p>
          {/each}
        {/if}
      </div>
    </div>
  {/if}

  {#if hoveredSectorId !== null}
    <div class="panel info hovered-info" draggable="true">
      <div class="panel-header">Hovered Element Info</div>
      <div class="panel-content">
        {#if sectors}
          {#each sectors.filter(s => s.id === hoveredSectorId) as sector}
            <p><strong>Type:</strong> {sector.level}</p>
            <p><strong>Name:</strong> {sector.name}</p>
            <p><strong>Position:</strong> ({sector.x.toFixed(0)}, {sector.y.toFixed(0)})</p>
            <p><strong>Size:</strong> {sector.width.toFixed(0)} × {sector.height.toFixed(0)}</p>
            <p><strong>Description:</strong> {sector.customData.description}</p>
            <p><strong>Created At:</strong> {sector.customData.metadata.createdAt}</p>
            <p><strong>Author:</strong> {sector.customData.metadata.author}</p>
          {/each}
        {/if}
      </div>
    </div>
  {/if}
</main>

<style>
  main {
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    overflow: hidden;
    position: relative;
    background: #1e1e1e;
  }

  .stage-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .panel {
    position: absolute;
    background: rgba(30, 30, 30, 0.9);
    border: 1px solid #444;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    color: #fff;
    min-width: 250px;
    cursor: move;
    user-select: none;
    backdrop-filter: blur(10px);
  }

  .panel-header {
    padding: 8px 12px;
    background: rgba(60, 60, 60, 0.5);
    border-bottom: 1px solid #444;
    border-radius: 8px 8px 0 0;
    font-weight: bold;
  }

  .panel-content {
    padding: 12px;
  }

  .controls {
    top: 20px;
    left: 20px;
  }

  .selected-info {
    top: 20px;
    right: 20px;
  }

  .hovered-info {
    bottom: 20px;
    right: 20px;
  }

  button {
    background: #2d2d2d;
    color: #fff;
    border: 1px solid #444;
    padding: 8px 16px;
    margin: 4px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
  }

  button:hover {
    background: #3d3d3d;
    border-color: #666;
  }

  .add-buttons {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
  }

  .page { border-left: 3px solid #666; }
  .view { border-left: 3px solid #0066ff; }
  .sector { border-left: 3px solid #ff3e00; }
  .delete { border-left: 3px solid #ff0033; }

  p {
    margin: 4px 0;
    font-size: 14px;
  }

  strong {
    color: #888;
  }
</style>