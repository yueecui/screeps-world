
export default function (creep: Creep) {
    if (creep.room.name != creep.memory.room){
        const pos = new RoomPosition(6, 21, creep.memory.room);
        creep.moveTo(pos);
        return;
    }

    {
        const found = creep.room.find(FIND_HOSTILE_CREEPS);
        if (found.length){
            const target = found[0]
            if (creep.rangedAttack(target) == ERR_NOT_IN_RANGE){
                creep.moveTo(target);
            }
            return;
        }
    }

    {
        const found = creep.room.find(FIND_HOSTILE_STRUCTURES);
        if (found.length){
            const target = found[0]
            if (creep.rangedAttack(target) == ERR_NOT_IN_RANGE){
                creep.moveTo(target);
            }
            return;
        }
    }

    creep.role = '回收';
}
