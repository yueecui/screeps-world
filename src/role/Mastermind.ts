import { createPrivateKey } from "crypto";

/**
 * 主脑
 */
export const roleMastermind: CreepRole = {
    run: function(creep) {
        // this.updateStatus(creep);
        this.execute(creep);
	},

    // 判断工作模式
    updateStatus: function(creep){
        if (creep.pos.x != 21 || creep.pos.y != 29){
            creep.moveTo(21, 29);
        }else{
            const tombstone = Game.getObjectById('60b45eae591230669d2f68ca' as Id<Tombstone>)!;
            for (const name in tombstone.store){
                creep.withdraw(tombstone, name as ResourceConstant);
            }

            return;
        }

    },

    // 根据工作模式执行
    execute: function(creep){
        if (creep.pos.x != 23 || creep.pos.y != 27){
            creep.moveTo(23, 27);
        }

        if (creep.store.getUsedCapacity() > 0){
            for (const name in creep.store){
                creep.transfer(creep.room.storage!, name as ResourceConstant);
            }
        }else{
            const link = creep.room.getStructureById(creep.room.memory.links[0])!;
            if (link.store[RESOURCE_ENERGY] > 0){
                creep.withdraw(link, RESOURCE_ENERGY);
            }
        }
    },
};
