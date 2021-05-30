import { roomExtensionBase } from './base';
import { roomExtensionContainer } from './container';
import { roomExtensionSpawn } from './spawn';
import { roomExtensionTower } from './tower';

export const roomExtension = function () {
    roomExtensionBase();
    roomExtensionContainer();
    roomExtensionSpawn();
    roomExtensionTower();
}
