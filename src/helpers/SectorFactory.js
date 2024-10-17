import RectangleSector from '../shapes/RectangleSector';
import CircleSector from '../shapes/CircleSector';
import PolygonSector from '../shapes/PolygonSector';

export default class SectorFactory {
    constructor(app) {
        this.app = app;
    }

    dataValidator = {
        'rectangle': (sectorData) => {
            return sectorData.x && sectorData.y && sectorData.width && sectorData.height;
        },
        'circle': (sectorData) => {
            return sectorData.centerX && sectorData.centerY && sectorData.radius;
        },
        'polygon': (sectorData) => {
            return sectorData.points && sectorData.points.length > 0;
        }
    }

    validateSectorData(sectorData) {
        const type = sectorData.type;
        if(!this.dataValidator[type]) {
            throw new Error(`Invalid sector type: ${type}`);
        }
        if(!this.dataValidator[type](sectorData)) {
            throw new Error(`Invalid sector data: ${JSON.stringify(sectorData)}`);
        }
    }

    createSector(sectorData) {
        switch(sectorData.type) {
            case 'rectangle':
                return new RectangleSector(sectorData);
            case 'circle':
                return new CircleSector(sectorData);
            case 'polygon':
                return new PolygonSector(sectorData);
        }
    }
}