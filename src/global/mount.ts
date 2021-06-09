import { creepExtension } from '../creep/creepMain';
import { roomExtension } from '../room/roomMain';
import { globalExtension } from './global';

export const Mount = {
    init: function(){
        globalExtension();
        creepExtension();
        roomExtension();
    }
};
