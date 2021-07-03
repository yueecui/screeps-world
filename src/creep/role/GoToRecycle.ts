/**
 * 将蚂蚁设为“回收”，其会自动回到Spawn被回收掉
 */

export default function (creep: Creep) {
    creep.recycleNearby(); // 回收周围的能量
    creep.say('♻️');

    if (creep.room.name != creep.bornRoom){
        const pos = new RoomPosition(25, 25, creep.bornRoom);
        creep.moveTo(pos);
        return;
    }

    let target = Game.getObjectById(creep.target!);
    if (!(target instanceof StructureSpawn)){
        target = null;
    }
    if (target == null){
        target = creep.pos.findClosestByRange(creep.room.spawns);
        if (target){
            creep.target = target.id
        }
    }

    if (target == null){
        creep.say('❓');
        return;
    }

    if (creep.pos.isNearTo(target)){
        target.recycleCreep(creep);
    }else{
        creep.moveTo(target);
    }
}
