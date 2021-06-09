import { creepExtension } from '../creep/main';
import { roomExtension } from '../room/main';

export const Mount = {
    init: function(){
        creepExtension();
        roomExtension();
    }
};
