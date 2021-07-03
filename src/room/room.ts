import roomExtensionProperty from './roomProperty';
import roomExtensionBase from './roomBase';
import roomExtensionContainer from './roomStore';
import roomExtensionSpawn from './roomSpawn';
import roomExtensionTower from './roomTower';
import roomExtensionTask from './roomTask';

export default function () {
    roomExtensionProperty();
    roomExtensionBase();
    roomExtensionContainer();
    roomExtensionSpawn();
    roomExtensionTower();
    roomExtensionTask();
}
