import { WORK_IDLE, WORK_NORMAL } from "@/global/constant";

/**
 * 主脑
 */
export default function(creep: Creep) {
    if (creep.work == WORK_IDLE){
        if (creep.inStayPos){
            creep.work = WORK_NORMAL;
        }else{
            creep.goToStay();
        }
    }else{
        creep.recycleNearby(); // 回收周围的能量
        masterMindWork(creep);
    }
}

// 主脑工作
const masterMindWork = function(creep: Creep){
    let target: AnyStoreStructure|undefined = creep.room.storage;
    if (!target || !target.pos.isNearTo(creep)) {target = creep.room.terminal};
    if (!target) return;
    const storage_link = creep.room.storageLink;
    if (!storage_link) return;

    // link简易版
    // controller link需要能量就往storage link放能量，否则往外拿存到storage里

    if (creep.room.controllerLinkNeedEnergy){
        const need_amount = storage_link.store.getFreeCapacity(RESOURCE_ENERGY);
        const pickup_amount = Math.min(creep.store.getFreeCapacity(RESOURCE_ENERGY), need_amount)
        if (need_amount > 0){
            if (pickup_amount == 0 || creep.store[RESOURCE_ENERGY] >= need_amount){
                creep.transfer(storage_link, RESOURCE_ENERGY);
            }else if(target.store[RESOURCE_ENERGY] >= pickup_amount ){
                creep.withdraw(target, RESOURCE_ENERGY, pickup_amount);
            }
        }
    }else{
        if (storage_link.store[RESOURCE_ENERGY] > 0 && creep.store.getFreeCapacity() > 0){
            creep.withdraw(storage_link, RESOURCE_ENERGY);
        }else if (creep.store.getUsedCapacity() > 0){
            for (const name in creep.store){
                creep.transfer(target, name as ResourceConstant);
                break;
            }
        }
    }

    // const link = Game.getObjectById(creep.room.links[0].id)!;
    // const terminal = Game.getObjectById('60b34555e97e270ece412ee5' as Id<StructureTerminal>)!;
    // const storage = creep.room.storage!;
    // if (link.store[RESOURCE_ENERGY] > 0){
    //     creep.withdraw(link, RESOURCE_ENERGY);
    // }else if (terminal.store[RESOURCE_KEANIUM] < 50000 && storage.store[RESOURCE_KEANIUM] > 0){
    //     creep.withdraw(storage, RESOURCE_KEANIUM);
    // }else if (terminal.store[RESOURCE_ENERGY] < 50000 && storage.store[RESOURCE_ENERGY] > 100000){
    //     creep.withdraw(storage, RESOURCE_ENERGY);
    // }

    // if (creep.store.getUsedCapacity() > 0){
    //     for (const name in creep.store){
    //         if (name == RESOURCE_ENERGY){
    //             if (terminal.store[RESOURCE_ENERGY] < 50000){
    //                 creep.transfer(terminal, RESOURCE_ENERGY);
    //             }else{
    //                 creep.transfer(storage, RESOURCE_ENERGY);
    //             }
    //         }else if(name == RESOURCE_KEANIUM){
    //             if (terminal.store[RESOURCE_KEANIUM] < 50000){
    //                 creep.transfer(terminal, RESOURCE_KEANIUM);
    //             }else{
    //                 creep.transfer(storage, RESOURCE_KEANIUM);
    //             }
    //         }else{
    //             creep.transfer(storage, name as ResourceConstant);
    //         }
    //     }
    // }
}
