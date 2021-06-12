import { CONTAINER_TYPE_SOURCE, ENERGY_ENOUGH, ENERGY_NEED, MODE_NONE } from "@/global/constant";

/**
 * 本模式主要是用来处理一些临时操作
 */

export default function (creep: Creep) {
    if (creep.baseName == 'MA'){
        attack_temp(creep);
    }else if (creep.room.code == 'R2'){
        r3temp(creep);
    }else{
        creep.say('呆');
    }
}

// 临时
const attack_temp = function(creep: Creep){
    if (creep.room.name != creep.memory.room){
        const pos = new RoomPosition(25, 25, creep.memory.room);
        creep.moveTo(pos);
        return;
    }

    {
        const found = creep.room.find(FIND_HOSTILE_SPAWNS);
        if (found.length){
            const target = found[0]
            if (creep.pos.isNearTo(target)){
                creep.attack(target);
            }else{
                creep.moveTo(target);
            }
            return;
        }
    }

    creep.role = '回收';
}

// R3临时搬运
const r3temp = function(creep: Creep){
    const storage = creep.room.storage;
    const terminal = creep.room.terminal;
    if (!storage) return;
    if (!terminal) return;
    if (storage.store.getUsedCapacity() == 0 && creep.store.getUsedCapacity() == 0){
        return;
    }
    if (terminal.store.getFreeCapacity() == 0)  return;
    if (creep.store.getUsedCapacity() > 0){
        if (creep.pos.isNearTo(terminal)){
            for (const name in creep.store){
                creep.transfer(terminal, name as ResourceConstant);
                break;
            }
        }else{
            creep.moveTo(terminal);
        }
    }else{
        if (creep.pos.isNearTo(storage)){
            if (storage.store[RESOURCE_ENERGY] > 10000){
                creep.withdraw(storage, RESOURCE_ENERGY);
                return;
            }
            for (const name in storage.store){
                if (name == RESOURCE_ENERGY) continue;
                creep.withdraw(storage, name as ResourceConstant);
                return;
            }
        }else{
            creep.moveTo(storage);
        }
    }
}


// 以前的脚本
const execute = function(creep: Creep){
    if (creep.room.name != 'W41N54'){
        return;
    }
    if (creep.mode == 1){
        const controller = creep.room.controller!;
        if (creep.pos.isNearTo(controller)){
            if (creep.claimController(controller) == OK){
                creep.memory.r = '回收';
            }
        }else{
            creep.moveTo(controller);
        }
    }else{
        creep.recycleNearby(); // 回收周围的能量
        creep.updateEnergyStatus();
        if (creep.energy == ENERGY_NEED){
            creep.obtainEnergy({
                container: [CONTAINER_TYPE_SOURCE],
                storage: false,
            });

            // const source_info = creep.room.sources[creep.memory.node];
            // const target = Game.getObjectById(source_info.id)!;
            // if (creep.pos.isNearTo(target)){
            //     creep.harvest(target);
            // }else{
            //     creep.moveTo(target);
            // }
        }else{
            // if (creep.memory.node == 0){
            //     const controller = creep.room.controller!;
            //     if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE){
            //         creep.moveTo(controller);
            //     }
            //     return;
            // }

            const found = creep.room.find(FIND_CONSTRUCTION_SITES);
            found.sort((a,b) => {
                return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
            })
            if (found.length){
                if (creep.build(found[0]) == ERR_NOT_IN_RANGE){
                    creep.moveTo(found[0]);
                }
            }else{
                creep.say('❓');
            }
        }
    }
}
