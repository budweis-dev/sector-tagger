# Svelte Tagger

A flexible and easy-to-use Svelte component for tagging sectors and regions in images or documents.

## Installation

```bash
npm install svelte-tagger
```

## Usage

```svelte
<script>
  import { Sector } from 'svelte-tagger';
</script>

<Sector
  x={100}
  y={100}
  width={200}
  height={150}
  color="#ff000080"
  level="sector"
  name="My Sector"
  isSelected={false}
  onClick={(e) => {
    // Handle click event
  }}
  onTransform={(newBounds) => {
    // Handle transformation
  }}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| x | number | required | X coordinate of the sector |
| y | number | required | Y coordinate of the sector |
| width | number | required | Width of the sector |
| height | number | required | Height of the sector |
| color | string | '#ff000080' | Color of the sector with opacity |
| isSelected | boolean | false | Whether the sector is selected |
| onClick | function | undefined | Click handler |
| onTransform | function | undefined | Transform handler |
| name | string | undefined | Name of the sector |
| level | string | 'sector' | Level of the sector ('page', 'view', or 'sector') |
| parentScale | number | 1 | Scale of the parent container |
| parentBounds | object | undefined | Bounds of the parent container |

## License

MIT
