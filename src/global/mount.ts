import { creepExtension } from '../creep/creepMain';
import { roomExtension } from '../room/roomMain';

export const Mount = {
    init: function(){
        creepExtension();
        roomExtension();
    }
};
