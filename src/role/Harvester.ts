import { WORK_IDLE, WORK_GOTO, WORK_HARVEST, WORK_REPAIR, MODE_HARVEST_ENERGY, MODE_HARVEST_MINERAL } from "@/constant";
import { createPrivateKey } from "crypto";

// 如果目标无视野，则先走到下面的位置
const MAP_POS: Record<string, [number,number]> = {
    'W34N57': [5, 21]
}

export const roleHarvester: Harvester = {
    run: function(creep) {
        // if (creep.memory.room != undefined){
            // this.otherRoom(creep);
        // }else{
            this.updateStatus(creep);
            this.execute(creep);
        // }
    },

    // 判断工作模式
    updateStatus: function(creep){
        if (creep.harvesterErrorCheck()){
            creep.setWorkState(WORK_IDLE);
            return;
        }
        switch(creep.getWorkState()){
            case WORK_GOTO:
                // 状态切换在执行时
                break;
            case WORK_HARVEST:
                // 状态切换在执行时
                break;
            case WORK_REPAIR:
            case WORK_IDLE:
                creep.harvesterIdleCheck();
                break;
        }
    },

    // 根据工作模式执行
    execute: function(creep){
        creep.recycleNearby(); // 回收周围的能量

        switch(creep.getWorkState()){
            case WORK_GOTO:
                creep.harvesterGoTo();
                break;
            case WORK_HARVEST:
                creep.harvesterDoWork();
                break;
            case WORK_REPAIR:  // 只有挖能量的会有这个操作
                creep.harvesterDoWorkRepair();
                break;
            case WORK_IDLE:
                break;
            default:
                creep.setWorkState(WORK_IDLE);
        }
    },

    // ROOM外采集测试
    otherRoom: function(creep){
        const pos = MAP_POS[creep.memory.room];
        const move_target = new RoomPosition(pos[0], pos[1], creep.memory.room);
        if (creep.room.name != creep.memory.room){
            creep.moveTo(move_target);
            return;
        }else{
            const source_set = creep.room.memory.sources[creep.memory.node];
            // console.log(JSON.stringify(source_set));
            const source_node = Game.getObjectById(source_set.s as Id<Source>)!;
            const container = Game.getObjectById(source_set.c as Id<StructureContainer>)!;

            if (creep.pos.getRangeTo(container) > 0){
                creep.moveTo(container);
                return;
            }else if (container.store.getFreeCapacity() > 100 && source_node.energy > 0){
                if (creep.harvest(source_node) == OK){
                    return;
                };
            }

            let target;
            const found = creep.pos.findInRange(FIND_STRUCTURES, 3, {filter: (struct) => {
                // 返回生命值不满，是路或是容器或是我自己的建筑
                return struct.hits < struct.hitsMax && (struct.structureType == STRUCTURE_CONTAINER
                    || struct.structureType == STRUCTURE_ROAD);
                }});

            if (found.length > 0){
                target = found[0];
                creep.repair(target);
            }

            if (creep.store[RESOURCE_ENERGY] < creep.getActiveBodyparts(WORK)){
                creep.withdraw(container, RESOURCE_ENERGY);
            }

        }
    }
};
