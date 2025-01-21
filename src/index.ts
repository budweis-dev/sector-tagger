import Sector from './Sector.svelte';
export type { Sector as SectorData } from './stores/sectors.ts';
export type { ApiConfig } from './stores/sectors.ts';
export { configureApi, sectors, fetchSectors, updateSector } from './stores/sectors.ts';
export { Sector };
