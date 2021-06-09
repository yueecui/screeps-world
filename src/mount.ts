import creepExtension from './creep/creep';
import roomExtension from './room/room';
import structureExtension from './structure/structure';
import globalExtension from './module/globalExtension';

export default function(){
    roomExtension();
    structureExtension();
    creepExtension();
    globalExtension();
    // if (!('sim' in Game.rooms)){
        console.log(`[${Game.time}] 重新挂载完成！`);
    // }
};

