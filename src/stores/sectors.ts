import { writable } from 'svelte/store';

export interface Sector {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  level: 'page' | 'view' | 'sector';
  customData?: Record<string, any>;
}

export interface ApiConfig {
  endpoint: string;
  transformResponse?: (data: any) => Sector[];
  headers?: Record<string, string>;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

let currentConfig: ApiConfig | null = null;

export const sectors = writable<Sector[]>([]);

export function configureApi(config: ApiConfig): void {
  currentConfig = config;
}

export async function fetchSectors(): Promise<void> {
  console.log('Fetching sectors...');
  if (!currentConfig) {
    console.warn('No API configuration found. Using example data.');
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
    return;
  }

  try {
    const response = await fetch(currentConfig.endpoint, {
      method: currentConfig.method || 'GET',
      headers: currentConfig.headers || {},
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    const data = await response.json();
    const transformedData = currentConfig.transformResponse 
      ? currentConfig.transformResponse(data)
      : data;

    sectors.set(transformedData);
  } catch (error) {
    console.error('Failed to fetch sectors:', error);
    throw error;
  }
}

export async function updateSector(updatedSector: Sector): Promise<void> {
  sectors.update(currentSectors => 
    currentSectors.map(sector => 
      sector.id === updatedSector.id ? updatedSector : sector
    )
  );
}
