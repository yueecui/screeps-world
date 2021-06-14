import { LAYOUT_SADAHARU } from "@/global/constant";

const checkSpawnTask = function(room: Room) {
    if (room.memory.lastSpawnTime == 0 || !(room.memory.lastSpawnTime < Game.time)) return;

    // 定春布局
    if (room.memory.layout == LAYOUT_SADAHARU){
        const sada = room.sada
        // for (const haru of )
    }
    // 普通布局
    else{

    }
}

export default function () {
    Room.prototype.inspectTask = function(){
        // 孵化

        // 控制器

        // 塔

        // 额外能量存储到storage

        // 拣墓碑

        // 拣废墟
    }
}
