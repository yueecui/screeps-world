import creepExtension from './creep/creepMain';
import roomExtension from './room/roomMain';
import globalExtension from './global/global';

export default function(){
    roomExtension();
    creepExtension();
    globalExtension();
    console.log(`[${Game.time}] 重新挂载完成！`);
};

