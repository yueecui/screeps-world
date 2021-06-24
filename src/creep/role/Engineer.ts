
export default function (creep: Creep) {
    if (creep.memory.room == null){
        creep.say('⁉️');
        return;
    }
    if (creep.room.name != creep.memory.room){
        const pos = new RoomPosition(25, 25, creep.memory.room);
        creep.moveTo(pos);
        return;
    }

    const controller = creep.room.controller!;
    if (creep.pos.isNearTo(controller)){
        // 已经有人占领的情况下回收
        if (controller.owner){
            creep.role ='回收';
        }
        if (controller.reservation){
            if (controller.reservation.username == 'Yuee'){
                creep.reserveController(controller);
            }else{
                creep.attackController(controller);
            }
        }else{
            creep.reserveController(controller);
        }
    }else{
        creep.moveTo(controller);
    }
}
