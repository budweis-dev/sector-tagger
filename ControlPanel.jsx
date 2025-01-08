import React, { useRef } from 'react';

export default function ControlPanel({ 
    selectedObject,
    selectedPage, 
    onUpdateTags, 
    onImageUpload, 
    onExport, 
    onImport 
  }) {
    const fileInputRef = useRef(null);
    const importInputRef = useRef(null);
  
    const handleTagsChange = (newTags) => {
      onUpdateTags(selectedObject.id, newTags);
    };
  
    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file && selectedPage) {
        const reader = new FileReader();
        reader.onload = () => {
          onImageUpload(selectedPage.id, reader.result);
        };
        reader.readAsDataURL(file);
      }
    };
  
    const handleExport = () => {
      onExport();
    };
  
    const handleImport = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const data = JSON.parse(reader.result);
            onImport(data);
          } catch (error) {
            console.error('Error parsing JSON:', error);
            alert('Invalid JSON file');
          }
        };
        reader.readAsText(file);
      }
    };
  
    return (
      <div className="absolute right-0 top-0 w-96 bg-white p-4 shadow-lg m-4 rounded-lg">
        <h2 className="text-lg font-bold mb-4">Control Panel</h2>
        
        {selectedPage && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2">Background Image for {selectedPage.name}</h3>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="w-full"
            />
          </div>
        )}
  
        <div className="mb-4 flex gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Export
          </button>
          <button
            onClick={() => importInputRef.current?.click()}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Import
          </button>
          <input
            type="file"
            ref={importInputRef}
            onChange={handleImport}
            accept=".json"
            className="hidden"
          />
        </div>
  
        {selectedObject && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2">
              Tags for {selectedObject.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedObject.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-200 rounded flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => {
                      const newTags = selectedObject.tags.filter((_, i) => i !== index);
                      handleTagsChange(newTags);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="Add tag..."
                className="px-2 py-1 border rounded"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value) {
                    const newTags = [...(selectedObject.tags || []), e.target.value];
                    handleTagsChange(newTags);
                    e.target.value = '';
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };