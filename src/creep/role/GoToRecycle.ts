/**
 * 将蚂蚁设为“回收”，其会自动回到Spawn被回收掉
 */

export default function (creep: Creep) {
    creep.recycleNearby(); // 回收周围的能量

    let target = Game.getObjectById(creep.target!);
    if (!(target instanceof StructureSpawn)){
        target = null;
        const room = Game.rooms[creep.belongRoom];
        if (room != null){
            target = creep.pos.findClosestByRange(room.spawns);
        }
    }

    if (target == null){
        creep.say('❓');
        return;
    }

    creep.say('♻️');
    if (creep.pos.isNearTo(target)){
        target.recycleCreep(creep);
    }else{
        creep.moveTo(target);
    }
}
