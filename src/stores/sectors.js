// src/stores/sectors.js
import { writable } from 'svelte/store';

const exampleSectors = [
  {
    id: 1,
    name: 'Sector 1',
    x: 50,
    y: 50,
    width: 100,
    height: 100,
    level: 'sector'
  },
  {
    id: 2,
    name: 'Sector 2',
    x: 200,
    y: 200,
    width: 150,
    height: 100,
    level: 'sector'
  }
];

export const sectors = writable([]);

export async function fetchSectors() {
  // Simulating API call with example data
  sectors.set(exampleSectors);
}

export async function updateSector(updatedSector) {
  // Update local store
  sectors.update(currentSectors => 
    currentSectors.map(sector => 
      sector.id === updatedSector.id ? updatedSector : sector
    )
  );
}