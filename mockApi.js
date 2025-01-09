const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

let mockPages = [
  {
    id: 'page1',
    name: 'Test Page 1',
    x: 10,
    y: 10,
    width: 800,
    height: 600,
    scale: 1,
    backgroundImage: null,
    views: [
      {
        id: 'view1',
        name: 'Main View',
        x: 50,
        y: 50,
        width: 400,
        height: 300,
        scale: 1,
        sectors: [
          {
            id: 'sector1',
            name: 'Header Section',
            x: 100,
            y: 100,
            width: 100,
            height: 100,
            color: '#ff000080',
            tags: ['header', 'navigation']
          },
          {
            id: 'sector2',
            name: 'Content Section',
            x: 250,
            y: 100,
            width: 150,
            height: 200,
            color: '#00ff0080',
            tags: ['content', 'main']
          }
        ]
      },
      {
        id: 'view2',
        name: 'Secondary View',
        x: 500,
        y: 50,
        width: 250,
        height: 200,
        scale: 1,
        sectors: [
          {
            id: 'sector3',
            name: 'Sidebar',
            x: 520,
            y: 70,
            width: 80,
            height: 150,
            color: '#0000ff80',
            tags: ['sidebar', 'navigation']
          }
        ]
      }
    ]
  }
];

// Pomocná funkce pro nalezení a aktualizaci objektu v stromové struktuře
const updateObjectInTree = (items, id, updateFn) => {
  const newItems = deepClone(items);
  
  const updateRecursive = (items) => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.id === id) {
        items[i] = updateFn(deepClone(item));
        return true;
      }
      if (item.views && updateRecursive(item.views)) return true;
      if (item.sectors && updateRecursive(item.sectors)) return true;
    }
    return false;
  };

  updateRecursive(newItems);
  return newItems;
};

export const api = {
    // Načtení stránek
    fetchPages: async () => {
      await delay(500); // Simulace síťové latence
      return deepClone(mockPages);
    },
  
    // Aktualizace stránky nebo objektu
    updatePage: async ({ id, data }) => {
      await delay(300);
      mockPages = updateObjectInTree(mockPages, id, (item) => ({
        ...item,
        ...data
      }));
      return { success: true, id };
    },
  
    // Aktualizace tagů
    updateTags: async ({ id, tags }) => {
      await delay(200);
      mockPages = updateObjectInTree(mockPages, id, (item) => ({
        ...item,
        tags
      }));
      return { success: true, id, tags };
    },
  
    // Upload obrázku
    uploadImage: async ({ pageId, imageData }) => {
      await delay(1000); // Delší delay pro simulaci uploadu
      
      // Simulujeme vytvoření URL pro obrázek
      const mockImageUrl = `mock-image-${Date.now()}.jpg`;
      
      mockPages = updateObjectInTree(mockPages, pageId, (page) => ({
        ...page,
        backgroundImage: mockImageUrl
      }));
  
      return { 
        success: true, 
        pageId, 
        imageUrl: mockImageUrl 
      };
    },
  
    // Export dat
    exportData: async () => {
      await delay(300);
      return deepClone(mockPages);
    },
  
    // Import dat
    importData: async (data) => {
      await delay(500);
      mockPages = deepClone(data);
      return { success: true };
    }
  };
  
  // Helper pro reset dat během testování
  export const resetMockData = () => {
    mockPages = deepClone(mockPages);
  };