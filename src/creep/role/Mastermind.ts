/**
 * 主脑
 */
export default function(creep: Creep) {
    execute(creep);
}

// 根据工作模式执行
const execute = function(creep: Creep){
    if (creep.pos.x != 23 || creep.pos.y != 27){
        creep.moveTo(23, 27);
    }


    const link = Game.getObjectById(creep.room.links[0].id)!;
    const terminal = Game.getObjectById('60b34555e97e270ece412ee5' as Id<StructureTerminal>)!;
    const storage = creep.room.storage!;
    if (link.store[RESOURCE_ENERGY] > 0){
        creep.withdraw(link, RESOURCE_ENERGY);
    }else if (terminal.store[RESOURCE_KEANIUM] < 50000 && storage.store[RESOURCE_KEANIUM] > 0){
        creep.withdraw(storage, RESOURCE_KEANIUM);
    }else if (terminal.store[RESOURCE_ENERGY] < 50000 && storage.store[RESOURCE_ENERGY] > 100000){
        creep.withdraw(storage, RESOURCE_ENERGY);
    }

    if (creep.store.getUsedCapacity() > 0){
        for (const name in creep.store){
            if (name == RESOURCE_ENERGY){
                if (terminal.store[RESOURCE_ENERGY] < 50000){
                    creep.transfer(terminal, RESOURCE_ENERGY);
                }else{
                    creep.transfer(storage, RESOURCE_ENERGY);
                }
            }else if(name == RESOURCE_KEANIUM){
                if (terminal.store[RESOURCE_KEANIUM] < 50000){
                    creep.transfer(terminal, RESOURCE_KEANIUM);
                }else{
                    creep.transfer(storage, RESOURCE_KEANIUM);
                }
            }else{
                creep.transfer(storage, name as ResourceConstant);
            }
        }
    }
}
