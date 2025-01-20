// src/stores/sectors.js
import { writable } from 'svelte/store';

export const sectors = writable([]);

export async function fetchSectors() {
  const response = await fetch('/api/sectors');
  const data = await response.json();
  sectors.set(data);
}

export async function updateSector(updatedSector) {
  await fetch(`/api/sectors/${updatedSector.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedSector),
  });
}