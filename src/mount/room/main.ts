import { roomExtensionProperty } from './property';
import { roomExtensionUtil } from './util';
import { roomExtensionContainer } from './container';
import { roomExtensionSpawn } from './spawn';
import { roomExtensionTower } from './tower';

export const roomExtension = function () {
    roomExtensionProperty();
    roomExtensionUtil();
    roomExtensionContainer();
    roomExtensionSpawn();
    roomExtensionTower();
}
