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
                creep.memory.node = 1;
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
            if (creep.store.getUsedCapacity() == 0){
                creep.memory.node = 1;
            }
            let target = creep.getTargetObject() as AnyStoreStructure | null;
            if (target){
                if (Object.keys(target.store).length == 0){
                    target = null;
                }
            }
            if (!target){
                const structures = creep.room.find(FIND_STRUCTURES, {filter: (struct) => {
                    if ('store' in struct){
                        return Object.keys(struct.store).length > 0;
                    }
                    return false;
                }});
                if (structures.length > 0){
                    target = structures[0] as AnyStoreStructure;
                }
            }
            if (target){
                if (!creep.pos.isNearTo(target)){
                    creep.moveTo(target);
                }else{
                    for (const name in target.store){
                        creep.withdraw(target, name as ResourceConstant);
                    }
                }
            }
        }
    },
};
