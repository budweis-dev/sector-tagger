import React, { useState, useCallback, useRef } from 'react';
import { Stage, Layer, Rect, Group, Transformer, Image } from 'react-konva';
import ControlPanel from './ControlPanel';
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './mockApi';

const queryClient = new QueryClient();

const Sector = ({ 
  x, 
  y, 
  width, 
  height, 
  color = '#ff000080', 
  isSelected, 
  onClick, 
  onTransform,
  parentScale = 1,
  name,
  level = 'sector',
  parentBounds
}) => {
  const shapeRef = useRef();
  const trRef = useRef();

  React.useEffect(() => {
    if (isSelected && trRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const borderColors = {
    page: '#000000',
    view: '#0000ff',
    sector: '#ff0000'
  };

  // Aplikujeme scale od rodiče
  const absoluteScale = parentScale;

  return (
    <>
      <Rect
        ref={shapeRef}
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        stroke={borderColors[level]}
        strokeWidth={2}
        onClick={onClick}
        onTap={onClick}
        draggable={level === 'sector' || level === 'view'}
        name={name}
        scaleX={absoluteScale}
        scaleY={absoluteScale}
        dragBoundFunc={pos => {
          if (!parentBounds) return pos;
          
          // Přepočítáme pozici s ohledem na scale
          const newX = Math.max(
            parentBounds.x,
            Math.min(pos.x, parentBounds.x + parentBounds.width - width * absoluteScale)
          );
          const newY = Math.max(
            parentBounds.y,
            Math.min(pos.y, parentBounds.y + parentBounds.height - height * absoluteScale)
          );
          
          return {
            x: newX,
            y: newY
          };
        }}
        onDragEnd={(e) => {
          const node = e.target;
          onTransform({
            x: node.x(),
            y: node.y(),
            width,
            height,
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX() / parentScale;
          const scaleY = node.scaleY() / parentScale;
          
          node.scaleX(parentScale);
          node.scaleY(parentScale);
          
          onTransform({
            x: node.x(),
            y: node.y(),
            width: Math.max(5, width * scaleX),
            height: Math.max(5, height * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (!parentBounds) return newBox;
            
            const minWidth = 5;
            const minHeight = 5;
            
            // Zajistíme, že transformovaný objekt zůstane uvnitř rodiče
            const maxWidth = (parentBounds.width / parentScale);
            const maxHeight = (parentBounds.height / parentScale);
            
            if (newBox.width < minWidth || newBox.height < minHeight ||
                newBox.width > maxWidth || newBox.height > maxHeight) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

const View = ({ data, isSelected, onSelect, onUpdate, parentScale = 1, parentBounds }) => {
  // Vypočítáme celkové měřítko pro potomky
  const totalScale = parentScale * (data.scale || 1);
  
  const viewBounds = {
    x: data.x,
    y: data.y,
    width: data.width * totalScale,
    height: data.height * totalScale
  };

  return (
    <Group>
      <Sector
        x={data.x}
        y={data.y}
        width={data.width}
        height={data.height}
        color="rgba(0,0,255,0.1)"
        isSelected={isSelected}
        onClick={() => onSelect(data.id)}
        onTransform={onUpdate}
        parentScale={parentScale}
        name={data.name}
        level="view"
        parentBounds={parentBounds}
      />
      {data.sectors.map((sector) => (
        <Sector
          key={sector.id}
          x={sector.x}
          y={sector.y}
          width={sector.width}
          height={sector.height}
          color={sector.color}
          isSelected={sector.isSelected}
          onClick={() => onSelect(sector.id)}
          onTransform={(newAttrs) => onUpdate(sector.id, newAttrs)}
          parentScale={totalScale}
          name={sector.name}
          level="sector"
          parentBounds={viewBounds}
        />
      ))}
    </Group>
  );
};

const Page = ({ data, selectedId, onSelect, onUpdate }) => {
  const [image, setImage] = useState(null);

  React.useEffect(() => {
    if (data.backgroundImage) {
      const img = new window.Image();
      img.src = data.backgroundImage;
      img.onload = () => {
        setImage(img);
      };
    }
  }, [data.backgroundImage]);

  const pageBounds = {
    x: data.x,
    y: data.y,
    width: data.width * (data.scale || 1),
    height: data.height * (data.scale || 1)
  };

  return (
    <Group>
      {image && (
        <Image
          image={image}
          x={data.x}
          y={data.y}
          width={data.width}
          height={data.height}
          scaleX={data.scale || 1}
          scaleY={data.scale || 1}
        />
      )}
      <Sector
        x={data.x}
        y={data.y}
        width={data.width}
        height={data.height}
        color="rgba(0,0,0,0.05)"
        isSelected={selectedId === data.id}
        onClick={() => onSelect(data.id)}
        onTransform={(newAttrs) => onUpdate(data.id, newAttrs)}
        parentScale={data.scale || 1}
        name={data.name}
        level="page"
      />
      {data.views.map((view) => (
        <View
          key={view.id}
          data={view}
          isSelected={selectedId === view.id}
          onSelect={onSelect}
          onUpdate={(newAttrs) => onUpdate(view.id, newAttrs)}
          parentScale={data.scale || 1}
          parentBounds={pageBounds}
        />
      ))}
    </Group>
  );
};

const ImageTagger = () => {
  const [selectedId, setSelectedId] = useState(null);
  const queryClient = useQueryClient();

  // Fetch pages using useQuery
  const { 
    isLoading, 
    isError, 
    data: pages = [], 
    error 
  } = useQuery({
    queryKey: ['pages'],
    queryFn: api.fetchPages,
    initialData: [{
      id: 'page1',
      name: 'Page 1',
      x: 10,
      y: 10,
      width: 800,
      height: 600,
      scale: 1,
      backgroundImage: null,
      views: [
        {
          id: 'view1',
          name: 'View 1',
          x: 50,
          y: 50,
          width: 400,
          height: 300,
          scale: 1,
          sectors: [
            {
              id: 'sector1',
              name: 'Sector 1',
              x: 100,
              y: 100,
              width: 100,
              height: 100,
              color: '#ff000080',
              tags: ['tag1', 'tag2']
            }
          ]
        }
      ]
    }]
  });

  // Update mutation
  const { mutate: updatePageMutation } = useMutation({
    mutationFn: api.updatePage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    }
  });

  // Tags mutation
  const { mutate: updateTagsMutation } = useMutation({
    mutationFn: api.updateTags,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    }
  });

  // Image upload mutation
  const { mutate: uploadImageMutation } = useMutation({
    mutationFn: api.uploadImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    }
  });

  const handleSelect = useCallback((id) => {
    setSelectedId(id);
  }, []);

  const handleUpdate = useCallback((id, newAttrs) => {
    updatePageMutation({ id, data: newAttrs });
  }, [updatePageMutation]);

  const handleUpdateTags = useCallback((id, newTags) => {
    updateTagsMutation({ id, tags: newTags });
  }, [updateTagsMutation]);

  const handleImageUpload = useCallback((pageId, imageData) => {
    uploadImageMutation({ pageId, imageData });
  }, [uploadImageMutation]);

  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(pages, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'image-tagger-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [pages]);

  const handleImport = useCallback((data) => {
    if (Array.isArray(data)) {
      queryClient.setQueryData(['pages'], data);
    } else if (data.pages) {
      queryClient.setQueryData(['pages'], data.pages);
    }
  }, [queryClient]);

  const findSelectedObject = useCallback(() => {
    if (!selectedId || !pages) return null;
    
    const findInItems = (items) => {
      for (let item of items) {
        if (item.id === selectedId) {
          return item;
        }
        if (item.views) {
          const found = findInItems(item.views);
          if (found) return found;
        }
        if (item.sectors) {
          const found = findInItems(item.sectors);
          if (found) return found;
        }
      }
      return null;
    };

    return findInItems(pages);
  }, [selectedId, pages]);

  const findSelectedPage = useCallback(() => {
    if (!pages?.length) return null;
    if (!selectedId) return pages[0];
    
    return pages.find(page => {
      if (page.id === selectedId) return true;
      return page.views.some(view => 
        view.id === selectedId || view.sectors.some(sector => sector.id === selectedId)
      );
    });
  }, [selectedId, pages]);

  if (isLoading) {
    return <div className="w-full h-screen flex items-center justify-center">Loading...</div>;
  }

  if (isError) {
    return <div className="w-full h-screen flex items-center justify-center text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="w-full h-screen bg-gray-100 relative">
      <ControlPanel
        selectedObject={findSelectedObject()}
        selectedPage={findSelectedPage()}
        onUpdateTags={handleUpdateTags}
        onImageUpload={handleImageUpload}
        onExport={handleExport}
        onImport={handleImport}
      />
      <Stage 
        width={window.innerWidth} 
        height={window.innerHeight}
        className="bg-white h-screen"
      >
        <Layer>
          {pages.map((page, index) => (
            <Page
              key={page.id}
              data={{
                ...page,
                y: index * (page.height + 50) + 10 // 50 spacing
              }}
              selectedId={selectedId}
              onSelect={handleSelect}
              onUpdate={handleUpdate}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

const ImageTaggerApp = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ImageTagger />
    </QueryClientProvider>
  );
};

export default ImageTaggerApp;