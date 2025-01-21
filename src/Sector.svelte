<!-- Sector.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { Layer, Rect, Transformer } from 'svelte-konva';
  import type { KonvaEventObject, Node, RectConfig, TransformerConfig } from 'konva';

  export let id: number;
  export let x: number;
  export let y: number;
  export let width: number;
  export let height: number;
  export let color: string = '#ff000080';
  export let isSelected: boolean;
  export let isHovering: boolean;
  export let onClick: (e: KonvaEventObject<MouseEvent>) => void;
  export let onTransform: (bounds: { x: number; y: number; width: number; height: number }) => void;
  export let onHover: (e: KonvaEventObject<MouseEvent>) => void;
  export let name: string;
  export let level: 'page' | 'view' | 'sector' = 'sector';
  export let parentBounds: { x: number; y: number; width: number; height: number };
  export let customData: Record<string, any> | undefined = undefined;

  let shapeRef: any;
  let trRef: any;

  const borderColors = {
    page: '#000000',
    view: '#0000ff',
    sector: '#ff0000'
  } as const;

  onMount(() => {
    if (isSelected && trRef) {
      trRef.nodes([shapeRef]);
      trRef.getLayer()?.batchDraw();
    }
  });

  const handleTransformEnd = (e: KonvaEventObject<Event>) => {
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

  const rectConfig: RectConfig = {
    x,
    y,
    width,
    height,
    fill: color,
    // stroke: borderColors[level],
    strokeWidth: 2,
    draggable: level === 'sector' || level === 'view',
    name
  };

  const transformerConfig: TransformerConfig = {
    boundBoxFunc: (oldBox, newBox) => {
      const box = { ...newBox, rotation: newBox.rotation || 0 };
      if (
        box.width < 5 ||
        box.height < 5 ||
        box.x < parentBounds.x ||
        box.y < parentBounds.y ||
        box.x + box.width > parentBounds.x + parentBounds.width ||
        box.y + box.height > parentBounds.y + parentBounds.height
      ) {
        return oldBox;
      }
      return box;
    },
    enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    resizeEnabled: true
  };
</script>

<Layer>
  <Rect
    bind:this={shapeRef}
    config={rectConfig}
    on:click={onClick}
    on:tap={onClick}
    on:transformend={handleTransformEnd}
    on:mouseenter={onHover}
  />

  {#if isHovering}
    <Transformer
      bind:this={trRef}
      config={transformerConfig}
    />
  {/if}
</Layer>