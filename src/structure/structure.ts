import structureExtensionBase from './structureBase';
import structureStore from './structureStore';
import structureTower from './structureTower';
import structureContainer from './structureContainer';

export default function () {
    structureExtensionBase();
    structureStore();
    structureTower();
    structureContainer();
}
