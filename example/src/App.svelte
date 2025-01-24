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
</script>

<main>
  <h1>Svelte Tagger Example</h1>
  
  <div class="controls">
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

  {#if selectedSectorId !== null}
    <div class="info">
      <h3>Selected Element Info</h3>
      {#if sectors}
        {#each sectors.filter(s => s.id === selectedSectorId) as sector}
          <p>Type: {sector.level}</p>
          <p>Name: {sector.name}</p>
          <p>Position: ({sector.x.toFixed(0)}, {sector.y.toFixed(0)})</p>
          <p>Size: {sector.width.toFixed(0)} × {sector.height.toFixed(0)}</p>
          <p>Description: {sector.customData.description}</p>
          <p>Created At: {sector.customData.metadata.createdAt}</p>
          <p>Author: {sector.customData.metadata.author}</p>
        {/each}
      {/if}
    </div>
  {/if}

  {#if hoveredSectorId !== null}
    <div class="info">
      <h3>Hovered Element Info</h3>
      {#if sectors}
        {#each sectors.filter(s => s.id === hoveredSectorId) as sector}
          <p>Type: {sector.level}</p>
          <p>Name: {sector.name}</p>
          <p>Position: ({sector.x.toFixed(0)}, {sector.y.toFixed(0)})</p>
          <p>Size: {sector.width.toFixed(0)} × {sector.height.toFixed(0)}</p>
          <p>Description: {sector.customData.description}</p>
          <p>Created At: {sector.customData.metadata.createdAt}</p>
          <p>Author: {sector.customData.metadata.author}</p>
        {/each}
      {/if}
    </div>
  {/if}
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    background-color: #da190b;
  }

  .stage-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 2em auto;
    background-color: #f0f0f0;
    border-radius: 8px;
    color: #666;
  }

</style>