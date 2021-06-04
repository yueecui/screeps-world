import { CONTAINER_TYPE_SOURCE, ENERGY_NEED, MODE_NONE } from "@/constant";

/**
 * 本模式主要是用来处理一些临时操作
 */
export const roleManual: CreepRole = {
    run: function(creep) {
        // creep.moveTo(39, 16)
        this.updateStatus(creep);
        this.execute(creep);
	},

    // 判断工作模式
    updateStatus: function(creep){
        if (creep.memory.node == undefined){
            creep.memory.node = 1;
        }
    },

    // 根据工作模式执行
    execute: function(creep){
        // 回家放东西
        if (creep.memory.node == 0){
            const target = Game.rooms['W37N55'].storage!;
            if (!creep.pos.isNearTo(target)){
                if (creep.room == target.room){
                    creep.moveTo(target);
                }else{
                    creep.moveTo(target, { reusePath: 30,  visualizePathStyle: {} });
                }
            }else{
                for (const name in creep.store){
                    creep.transfer(target, name as ResourceConstant);
                }
            }
            if (creep.store.getUsedCapacity() == 0){
                if (creep.ticksToLive! > 500){
                    creep.memory.node = 1;
                }else{
                    creep.memory.r = '回收'
                }

            }
        }
        // 去中转点
        else if (creep.memory.node == 1){
            const target = new RoomPosition(39, 23, 'W38N54');
            if (creep.pos.getRangeTo(target) == 0){
                if (creep.store.getUsedCapacity() == 0){
                    creep.memory.node = 3; // 先去远的那个搬G
                }else{
                    creep.memory.node = 0;
                }
            }else{
                creep.moveTo(target, { reusePath: 30,  visualizePathStyle: {} });
            }
        }
        // 去离得近的那个基地
        else if (creep.memory.node == 2){
            const target = new RoomPosition(2, 34, 'W37N53');
            if (creep.pos.getRangeTo(target) == 0){
                creep.memory.node = 4;
            }else{
                creep.moveTo(target, { reusePath: 30,  visualizePathStyle: {} });
            }
        }
        // 去离得远的那个基地
        else if (creep.memory.node == 3){
            const target = new RoomPosition(2, 23, 'W36N52');
            if (creep.pos.getRangeTo(target) == 0){
                creep.memory.node = 4;
            }else{
                creep.moveTo(target, { reusePath: 30,  visualizePathStyle: {} });
            }
        }
        // 搬东西
        else if (creep.memory.node == 4){
            if (creep.store.getFreeCapacity() == 0){
                creep.memory.node = 1;
            }
            let target = creep.getTargetObject() as AnyStoreStructure | null;
            if (target){
                let energy = 0;
                let other = 0;
                for (const name in target.store){
                    if (name == RESOURCE_ENERGY){
                        energy += target.store[RESOURCE_ENERGY];
                    }else{
                        other += target.store[name as ResourceConstant]
                    }
                }
                if (other == 0 && energy <= 300){
                    target = null;
                }
            }
            if (!target){
                const structures = creep.room.find(FIND_STRUCTURES, {filter: (target) => {
                    if ('store' in target){
                        let energy = 0;
                        let other = 0;
                        for (const name in target.store){
                            if (name == RESOURCE_ENERGY){
                                energy += target.store[RESOURCE_ENERGY];
                            }else{
                                other += target.store[name as ResourceConstant]
                            }
                        }
                        if (other == 0 && energy <= 300){
                            return false;
                        }else{
                            return true;
                        }
                    }
                    return false;
                }});
                if (structures.length > 0){
                    target = structures[0] as AnyStoreStructure;
                }
            }
            if (target){
                if (!creep.pos.isNearTo(target)){
                    creep.moveTo(target, {visualizePathStyle: {}});
                }else{
                    if (RESOURCE_GHODIUM in target.store){
                        creep.withdraw(target, RESOURCE_GHODIUM);
                    }else{
                        for (const name in target.store){
                            creep.withdraw(target, name as ResourceConstant);
                        }
                    }
                }
            }else{
                creep.memory.node = 1;
            }
        }
    },
};
