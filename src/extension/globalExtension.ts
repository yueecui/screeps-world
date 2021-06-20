import { Sadaharu } from "@/module/sadaharuLayout";
import { ConsoleCommandRoom } from '@/module/cmdRoom';
import roomResource from '@/module/helper_roomResource';

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

    global.update = function () {
        // 定春布局刷新显示
        (global as any).haru.update();
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

    // 扩展帮助指令
    roomResource();
}
