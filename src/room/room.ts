import roomExtensionProperty from './roomProperty';
import roomExtensionBase from './roomBase';
import roomExtensionContainer from './roomStore';
import roomExtensionSpawn from './roomSpawn';
import roomExtensionTask from './roomTask';

export default function () {
    roomExtensionProperty();
    roomExtensionBase();
    roomExtensionContainer();
    roomExtensionSpawn();
    roomExtensionTask();
}
