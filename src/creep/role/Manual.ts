import { CONTAINER_TYPE_SOURCE, ENERGY_ENOUGH, ENERGY_NEED, MODE_NONE } from "@/global/constant";

/**
 * 本模式主要是用来处理一些临时操作
 */

export default function (creep: Creep) {
    creep.say('呆');
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
