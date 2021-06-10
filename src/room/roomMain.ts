import roomExtensionProperty from './roomProperty';
import roomExtensionUtil from './roomUtil';
import roomExtensionContainer from './roomContainer';
import roomExtensionSpawn from './roomSpawn';
import roomExtensionTower from './roomTower';

export default function () {
    roomExtensionProperty();
    roomExtensionUtil();
    roomExtensionContainer();
    roomExtensionSpawn();
    roomExtensionTower();
}
