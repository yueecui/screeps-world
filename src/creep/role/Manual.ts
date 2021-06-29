import { CONTAINER_TYPE_SOURCE, ENERGY_ENOUGH, ENERGY_NEED, MODE_NONE } from "@/common/constant";
import { ICON_QUESTION_MARK_1, ICON_QUESTION_MARK_2, ICON_QUESTION_MARK_3 } from "@/common/emoji";

/**
 * 本模式主要是用来处理一些临时操作
 */

export default function (creep: Creep) {
    if (creep.workRoom == 'W35N57'){
        R1_TT3(creep);
        return;
    }

    creep.say('呆');
}

const R1_TT = function (creep: Creep) {
    const source_store = creep.room.storage;
    if (!source_store){ return; }
    const terminal = creep.room.terminal!;
    if (terminal.store.getFreeCapacity() == 0) { return; }
    if (creep.store.getUsedCapacity() == 0 && source_store.store.getFreeCapacity() < 1000000){
        if (creep.pos.isNearTo(source_store)){
            if (source_store.store['energy'] > 0){
                creep.withdraw(source_store, 'energy');
            }else{
                for (const name in source_store.store){
                    if (name != 'K'){
                        creep.withdraw(source_store, name as ResourceConstant);
                        return;
                    }
                }
                creep.withdraw(source_store, 'K');
            }
            return;
        }else{
            creep.moveTo(source_store);
            return;
        }
    }else{
        if (creep.pos.isNearTo(terminal)){
            for (const name in creep.store){
                creep.transfer(terminal, name as ResourceConstant);
                return;
            }
        }else{
            creep.moveTo(terminal);
            return;
        }
    }
}


const R1_TT2 = function (creep: Creep) {
    const source_store = Game.getObjectById('60dab65cc779dc7c2c3700d9' as Id<Ruin>);
    if (!source_store){ return; }
    let target: AnyStoreStructure|undefined = creep.room.storage;
    if (!target) target = creep.room.terminal!;
    if (target.store.getFreeCapacity() == 0) { return; }
    if (creep.store.getUsedCapacity() == 0 && source_store.store['K'] > 0){
        if (creep.pos.isNearTo(source_store)){
            creep.withdraw(source_store, 'K');
            return;
        }else{
            creep.moveTo(source_store);
            return;
        }
    }else{
        if (creep.pos.isNearTo(target)){
            for (const name in creep.store){
                creep.transfer(target, name as ResourceConstant);
                return;
            }
        }else{
            creep.moveTo(target);
            return;
        }
    }
}

const R1_TT3 = function (creep: Creep) {
    const storage = creep.room.storage!;
    if (creep.memory.node == undefined){
        creep.memory.node = 0;
    }
    if (creep.memory.node == 0 && creep.store.getFreeCapacity() == 0){
        creep.memory.node = 1;
    }else if (creep.memory.node == 1 && creep.store.getUsedCapacity() == 0){
        creep.memory.node = 0;
    }
    creep.recycleNearby();
    if (creep.memory.node == 0){
        const finds = creep.room.find(FIND_DROPPED_RESOURCES);
        if (finds.length > 0){
            const target = creep.pos.findClosestByRange(finds)!;
            if (creep.pos.isNearTo(target)){
                creep.pickup(target);
                return;
            }else{
                creep.moveTo(target);
                return;
            }
        }else{
            creep.room.memory.spawnConfig.amount['TT'] = 0;
            creep.memory.node = 1;
        }
    }else{
        if (creep.pos.isNearTo(storage)){
            for (const name in creep.store){
                creep.transfer(storage, name as ResourceConstant);
                return;
            }
        }else{
            creep.moveTo(storage);
            return;
        }
    }
}
