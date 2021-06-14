import { Sadaharu } from "./sadaharu";
import { ConsoleCommandRoom } from './cmdRoom';

export default function () {
    // 初始化
    if (Memory.tempFlags == undefined){
        Memory.tempFlags = {};
    }
    if (Memory.roomCodeReplace == undefined){
        Memory.roomCodeReplace = {};
    }
    if (Memory.sadaharuConfigs == undefined){
        Memory.sadaharuConfigs = {};
    }
    // 初始化全局缓存
    global.cache = {
        rooms: {}
    }

    // 扩展控制命令行
    const G = global as any;
    for (const room_name in Game.rooms){
        const room = Game.rooms[room_name];
        if (room.my){
            G[room_name] = new ConsoleCommandRoom(room_name);
            if (!(room.code in G)) G[room.code] = G[room_name];
        }
    }
    G.haru = new Sadaharu();
}
