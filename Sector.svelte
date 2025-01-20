<!-- Sector.svelte -->
<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

  export let x;
  export let y;
  export let width;
  export let height;
  export let color = '#ff000080';
  export let isSelected;
  export let onClick;
  export let onTransform;
  export let parentScale = 1;
  export let name;
  export let level = 'sector';
  export let parentBounds;

  let shapeRef;
  let trRef;

  const borderColors = {
    page: '#000000',
    view: '#0000ff',
    sector: '#ff0000'
  };

  onMount(() => {
    if (isSelected && trRef) {
      trRef.nodes([shapeRef]);
      trRef.getLayer().batchDraw();
    }
  });

  const handleTransformEnd = (e) => {
    const node = shapeRef;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    onTransform({
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY)
    });
  };
</script>

<Rect
  bind:this={shapeRef}
  {x}
  {y}
  {width}
  {height}
  fill={color}
  stroke={borderColors[level]}
  strokeWidth={2}
  on:click={onClick}
  on:tap={onClick}
  draggable={level === 'sector' || level === 'view'}
  name={name}
  on:transformend={handleTransformEnd}
/>

{#if isSelected}
  <Transformer
    bind:this={trRef}
    boundBoxFunc={(oldBox, newBox) => {
      if (
        newBox.width < 5 ||
        newBox.height < 5 ||
        newBox.x < parentBounds.x ||
        newBox.y < parentBounds.y ||
        newBox.x + newBox.width > parentBounds.x + parentBounds.width ||
        newBox.y + newBox.height > parentBounds.y + parentBounds.height
      ) {
        return oldBox;
      }
      return newBox;
    }}
  />
{/if}