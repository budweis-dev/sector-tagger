/// <reference types="svelte" />
import type Konva from 'konva';

declare module 'konva' {
  export interface KonvaEventObject<T> {
    target: Node;
    evt: T;
    currentTarget: Node;
    cancelBubble: boolean;
  }

  export interface Node {
    getLayer(): Layer | null;
    scaleX(): number;
    scaleY(): number;
    x(): number;
    y(): number;
    width(): number;
    height(): number;
  }

  export interface Layer extends Node {
    batchDraw(): void;
  }

  export interface RectConfig {
    x: number;
    y: number;
    width: number;
    height: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    draggable?: boolean;
    name?: string;
  }

  export interface TransformerConfig {
    boundBoxFunc?: (oldBox: { x: number; y: number; width: number; height: number, rotation: number }, 
                   newBox: { x: number; y: number; width: number; height: number, rotation: number }) 
                   => { x: number; y: number; width: number; height: number, rotation: number };
    rotateEnabled?: boolean;
    keepRatio?: boolean;
    enabledAnchors?: string[];
    resizeEnabled?: boolean;
  }
}

declare module 'svelte-konva' {
  import type { SvelteComponentTyped } from 'svelte';

  interface StageProps {
    config: {
      width: number;
      height: number;
    };
  }

  interface LayerProps {
    config?: Konva.LayerConfig;
  }

  interface RectProps {
    config: Konva.RectConfig;
  }

  interface TransformerProps {
    config: Konva.TransformerConfig;
  }

  export class Stage extends SvelteComponentTyped<StageProps> {}
  export class Layer extends SvelteComponentTyped<LayerProps> {}
  export class Rect extends SvelteComponentTyped<RectProps> {}
  export class Transformer extends SvelteComponentTyped<TransformerProps> {}
}
