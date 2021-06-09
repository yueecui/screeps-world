// 建筑工
// 具有2组指令，一组建造，一组修理
// model为B的优先建造，没有可建造的时修理
// model为R的优先修理，没有可修理的时候建造

// 修理一旦开始就会修完

import {
    ENERGY_NEED,
    WORK_IDLE, WORK_BUILD, WORK_REPAIR,
    MODE_BUILDER, MODE_REPAIRER, CONTAINER_TYPE_SOURCE, ENERGY_ENOUGH } from "@/global/constant";
import { filter } from "lodash";

const REPAIR_PERCENT = 0.7;  // 耐久度低到什么程度开始修理

export const roleBuilder: Builder = {
    run: function(creep) {
        this.updateStatus(creep);
        this.execute(creep);
	},

    // 判断工作模式
    updateStatus: function(creep){
        switch(creep.work){
            case WORK_BUILD:
                break;
            case WORK_REPAIR:
                break;
            case WORK_IDLE:
                if (creep.memory.mode == MODE_BUILDER){
                    creep.work = WORK_BUILD;
                }else if (creep.memory.mode == MODE_REPAIRER){
                    creep.work = WORK_REPAIR;
                }
                break;
        }
    },

    // 根据工作模式执行
    execute: function(creep){
        if (creep.memory.room && creep.room.name != creep.memory.room){
            creep.moveTo(new RoomPosition(25, 25, creep.memory.room));
            return;
        }
        creep.recycleNearby(); // 回收周围的能量

        const remove_flag = Game.flags['Remove'];
        if (remove_flag && creep.room.name == remove_flag.room!.name){
            // 寻找一个可以修理的目标
            const target = _.find(remove_flag.pos.lookFor(LOOK_STRUCTURES), { structureType: STRUCTURE_ROAD });
            if (target){
                if (creep.dismantle(target) == ERR_NOT_IN_RANGE){
                    creep.moveTo(target);
                }
                return;
            }
        }

        const obtain_energy = (creep: Creep) => {
            if (creep.room.storage){
                creep.obtainEnergy({
                    storage: true,
                });
                return;
            // 外矿
            }else if(creep.memory.room){
                if (creep.store.getFreeCapacity() == 0){
                    creep.energy = ENERGY_ENOUGH;
                }
                for (const source_info of creep.room.sources){
                    const source_node = Game.getObjectById(source_info.id)!;
                    if (source_node.energy > 0){
                        if (creep.pos.isNearTo(source_node)){
                            creep.harvest(source_node);
                        }else{
                            creep.moveTo(source_node);
                        }
                        return;
                    }
                }
            }
            creep.obtainEnergy({
                container: [CONTAINER_TYPE_SOURCE],
            });
        }


        if (creep.energy == ENERGY_NEED){
            obtain_energy(creep);
        }else{
            if (creep.store[RESOURCE_ENERGY] == 0){
                creep.energy = ENERGY_NEED;
                obtain_energy(creep);
                return;
            }
            let target;
            if (creep.work == WORK_REPAIR){
                target = this.findRepairTarget(creep);
                if (target){
                    return this.repairTarget(creep, target);
                }
                target = this.findBuildTarget(creep);
                if (target){
                    return this.buildTarget(creep, target);
                }
                target = this.findRepairWall(creep);
                if (target){
                    return this.repairTargetWall(creep, target);
                }
                target = this.findRepairRampart(creep);
                if (target){
                    return this.repairTargetRampart(creep, target);
                }
                creep.goToStay();
            }else{
                target = this.findBuildTarget(creep);
                if (target){
                    return this.buildTarget(creep, target);
                }
                target = this.findRepairTarget(creep);
                if (target){
                    return this.repairTarget(creep, target);
                }
                if (creep.memory.room){
                    creep.role = '回收';
                }else{
                    creep.goToStay();
                }
            }
        }
    },

    // 寻找一个可以建造的目标
	findBuildTarget: function(creep){
	   const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
       const last_target = targets.filter((s) => {return s.id == creep.memory.t});
       if (last_target[0]){
           return last_target[0];
       }else{
            if (targets[0]){
                creep.memory.t = targets[0].id;
                return targets[0];
            }else{
                creep.memory.t = null;
                return null;
            }
       }
	},
    // 建造目标
    buildTarget: function(creep, target){
        if(creep.build(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    },
    // 寻找一个可以修理的目标
    findRepairTarget: function(creep){
        let targets = creep.room.find(FIND_STRUCTURES, { filter: function(s){
            return (s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART) && (s.hits < s.hitsMax);
        }})
        const last_target = targets.filter((s) => { return s.id == creep.memory.t; });
        if (last_target[0]){
            return last_target[0];
        }else{
            targets = targets.filter((s) => {
                return (s.hits/s.hitsMax) < REPAIR_PERCENT}
            )
            targets.sort((a, b) => {
                return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
            })

            if (targets[0]){
                creep.memory.t = targets[0].id;
                return targets[0];
            }else{
                creep.memory.t = null;
                return null;
            }
        }
    },
    // 修理目标
    repairTarget: function(creep, target){
        if (creep.repair(target) == ERR_NOT_IN_RANGE){
            creep.moveTo(target);
        }
    },
    // 寻找一个可以修理的目标
    findRepairWall: function(creep){
        let targets = creep.room.find(FIND_STRUCTURES, { filter: function(s){
            return s.structureType == STRUCTURE_WALL && s.hits < 100000;
        }}) as StructureWall[];
        const last_target = targets.filter((s) => { return s.id == creep.memory.t as Id<StructureRampart | StructureWall>; });
        if (last_target[0]){
            return last_target[0];
        }else{
            targets.sort((a, b) => {
                return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
            })

            if (targets[0]){
                creep.memory.t = targets[0].id;
                return targets[0];
            }else{
                creep.memory.t = null;
                return null;
            }
        }
    },
    // 修理目标
    repairTargetWall: function(creep, target){
        if (target.hits >= 100000){
            creep.target = null;
            return;
        }
        if (creep.repair(target) == ERR_NOT_IN_RANGE){
            creep.moveTo(target);
        }
    },
    // 寻找一个可以修理的目标
    findRepairRampart: function(creep){
        const target = Game.getObjectById(creep.target!) as StructureRampart | null;
        if (target && target.hits < 100000){
            return target;
        }

        let targets = creep.room.find(FIND_STRUCTURES, { filter: function(s){
            return s.structureType == STRUCTURE_RAMPART && s.hits < 50000;
        }}) as StructureRampart[];

        if (targets[0]){
            targets.sort((a, b) => {
                return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
            })
            creep.memory.t = targets[0].id;
            return targets[0];
        }else{
            creep.memory.t = null;
            return null;
        }
    },
    // 修理目标
    repairTargetRampart: function(creep, target){
        if (target.hits >= 100000){
            creep.target = null;
            return;
        }
        if (creep.repair(target) == ERR_NOT_IN_RANGE){
            creep.moveTo(target);
        }
    },
};
