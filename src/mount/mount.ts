import { creepExtension } from './mount.Creep';
import { roomExtension } from './mount.Room';

export const Mount = {
    init: function(){
        creepExtension();
        roomExtension();
    }
};
