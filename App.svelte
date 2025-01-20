<!-- src/App.svelte -->
<script>
  import { onMount } from 'svelte';
  import { sectors, fetchSectors, updateSector } from './stores/sectors';
  import Sector from './components/Sector.svelte';

  onMount(() => {
    fetchSectors();
  });

  function handleTransform(sector, { x, y, width, height }) {
    const updatedSector = { ...sector, x, y, width, height };
    updateSector(updatedSector);
  }
</script>

<main>
  {#each $sectors as sector}
    <Sector
      {...sector}
      color="#ff000080"
      isSelected={true}
      onClick={() => console.log('Sector clicked:', sector.name)}
      onTransform={(transform) => handleTransform(sector, transform)}
      parentBounds={{ x: 0, y: 0, width: 800, height: 600 }}
    />
  {/each}
</main>

<style>
  main {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f0f0f0;
  }
</style>