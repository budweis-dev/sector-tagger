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
  export let parentId: number | null = null;
  export let level: 'page' | 'view' | 'sector' = 'sector';
  export let parentBounds: { x: number; y: number; width: number; height: number; scale?: number; rotation?: number } | null = null;
  export let customData: Record<string, any> | undefined = undefined;

  let shapeRef: any;
  let trRef: any;

  const borderColors = {
    page: '#000000',
    view: '#0000ff',
    sector: '#ff0000'
  } as const;

  $: effectiveX = parentBounds ? x + parentBounds.x : x;
  $: effectiveY = parentBounds ? y + parentBounds.y : y;
  $: effectiveScale = parentBounds?.scale || 1;
  $: effectiveRotation = parentBounds?.rotation || 0;

  onMount(() => {
    if (isSelected && trRef) {
      trRef.nodes([shapeRef]);
      trRef.getLayer()?.batchDraw();
    }
  });

  const handleTransformEnd = (e: KonvaEventObject<Event>) => {
    const node = shapeRef;
    const scaleX = node.scaleX() / effectiveScale;
    const scaleY = node.scaleY() / effectiveScale;
    const rotation = node.rotation() - effectiveRotation;

    node.scaleX(effectiveScale);
    node.scaleY(effectiveScale);
    node.rotation(effectiveRotation);

    onTransform({
      x: parentBounds ? node.x() - parentBounds.x : node.x(),
      y: parentBounds ? node.y() - parentBounds.y : node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY)
    });
  };

  const rectConfig: RectConfig = {
    x: effectiveX,
    y: effectiveY,
    width,
    height,
    fill: color,
    stroke: borderColors[level],
    strokeWidth: 2,
    draggable: level === 'sector' || level === 'view',
    name,
    scaleX: effectiveScale,
    scaleY: effectiveScale,
    rotation: effectiveRotation
  };

  const transformerConfig: TransformerConfig = {
    boundBoxFunc: (oldBox, newBox) => {
      const box = { ...newBox, rotation: newBox.rotation || 0 };
      if (
        box.width < 5 ||
        box.height < 5 ||
        box.x < parentBounds?.x ||
        box.y < parentBounds?.y ||
        box.x + box.width > parentBounds?.x + parentBounds?.width ||
        box.y + box.height > parentBounds?.y + parentBounds?.height
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