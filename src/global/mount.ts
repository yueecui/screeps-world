import creepExtension from '../creep/creepMain';
import roomExtension from '../room/roomMain';
import globalExtension from './global';

export default function(){
    globalExtension();
    creepExtension();
    roomExtension();

    console.log(`[${Game.time}] 重新挂载完成！`);
};
