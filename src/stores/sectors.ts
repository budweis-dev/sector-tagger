import { writable } from 'svelte/store';

export interface Sector {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  level: 'page' | 'view' | 'sector';
}

export const sectors = writable<Sector[]>([]);

export async function fetchSectors(): Promise<void> {
  // Simulating API call with example data
  sectors.set([
    {
      id: 1,
      name: 'Example Sector 1',
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      level: 'sector'
    },
    {
      id: 2,
      name: 'Example Sector 2',
      x: 200,
      y: 200,
      width: 150,
      height: 100,
      level: 'sector'
    }
  ]);
}

export async function updateSector(updatedSector: Sector): Promise<void> {
  sectors.update(currentSectors => 
    currentSectors.map(sector => 
      sector.id === updatedSector.id ? updatedSector : sector
    )
  );
}
