import creepExtension from './creep/creepMain';
import roomExtension from './room/roomMain';
import globalExtension from './global/global';

export default function(){
    roomExtension();
    creepExtension();
    globalExtension();
    // if (!('sim' in Game.rooms)){
        console.log(`[${Game.time}] 重新挂载完成！`);
    // }
};

