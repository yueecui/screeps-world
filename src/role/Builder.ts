// 建筑工
// 具有2组指令，一组建造，一组修理
// model为B的优先建造，没有可建造的时修理
// model为R的优先修理，没有可修理的时候建造

// 修理一旦开始就会修完

import {
    ENERGY_NEED,
    WORK_IDLE, WORK_BUILD, WORK_REPAIR,
    MODE_BUILDER, MODE_REPAIRER, CONTAINER_TYPE_SOURCE } from "@/constant";

const REPAIR_PERCENT = 0.7;  // 耐久度低到什么程度开始修理

export const roleBuilder: Builder = {
    run: function(creep) {
        this.updateStatus(creep);
        this.execute(creep);
	},

    // 判断工作模式
    updateStatus: function(creep){
        switch(creep.getWorkState()){
            case WORK_BUILD:
                break;
            case WORK_REPAIR:
                break;
            case WORK_IDLE:
                if (creep.memory.mode == MODE_BUILDER){
                    creep.setWorkState(WORK_BUILD);
                }else if (creep.memory.mode == MODE_REPAIRER){
                    creep.setWorkState(WORK_REPAIR);
                }
                break;
        }
    },

    // 根据工作模式执行
    execute: function(creep){
        if (creep.memory.flag && Game.flags['remove']){
            const flag = Game.flags['remove'];
            if (creep.room.name != 'W34N57'){
                creep.moveTo(flag);
                return;
            }
            // 寻找一个可以修理的目标
            let r_targets = flag.pos.findInRange(FIND_STRUCTURES, 3, { filter: function(s){
                return (s.structureType == STRUCTURE_ROAD);
            }})

            if (r_targets.length > 0){
                if (creep.dismantle(r_targets[0]) == ERR_NOT_IN_RANGE){
                    creep.moveTo(r_targets[0]);
                }
                return;
            }
        }
        // 临时
        if (creep.memory.flag && Game.flags[creep.memory.flag]){
            const flag = Game.flags[creep.memory.flag];
            // if (!creep.pos.isNearTo(flag)){
            //     creep.moveTo(flag);
            // }
            if (creep.ticksToLive! < 100){
                creep.memory.r = '回收';
                return;
            }

            creep.updateEnergyStatus();

            if (creep.getEnergyState() == ENERGY_NEED){
                if (creep.room.name != 'W34N57'){
                    creep.moveTo(flag);
                    return;
                }
                const source = Game.getObjectById('5bbcab199099fc012e632d04' as Id<Source>);
                if (creep.harvest(source!) == ERR_NOT_IN_RANGE){
                    creep.moveTo(source!);
                }

                // if (creep.room.name != 'W34N57'){
                //     creep.moveTo(Game.rooms['W35N57']!.storage!);
                // }else{
                //     creep.clearTarget();
                //     creep.obtainEnergy({
                //         storage: true,
                //     });
                // }

            }else{
                if (creep.room.name != 'W34N57'){
                    creep.moveTo(flag);
                    return;
                }
                // 寻找一个可以建造的目标
                let b_targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                let b_target;
                if (b_targets[0]){
                    creep.memory.t = b_targets[0].id;
                    b_target = b_targets[0];
                }else{
                    creep.memory.t = null;
                    b_target = null;
                }
                if (b_target){
                    if (creep.build(b_target) == ERR_NOT_IN_RANGE){
                        creep.moveTo(b_target);
                    }
                }

                // 寻找一个可以修理的目标
                let r_targets = flag.pos.findInRange(FIND_STRUCTURES, 3, { filter: function(s){
                    return (s.structureType == STRUCTURE_ROAD) && (s.hits < s.hitsMax);
                }})
                let r_target;
                // const last_target = targets.filter((s) => { return s.id == creep.memory.t; });
                // if (last_target[0]){
                //     target = last_target[0];
                // }else{
                    r_targets = r_targets.filter((s) => {
                        return s.hits<s.hitsMax}
                    )
                    r_targets.sort((a, b) => {
                        return (a.hits/a.hitsMax - b.hits/b.hitsMax)
                        // return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
                    })

                    if (r_targets[0]){
                        creep.memory.t = r_targets[0].id;
                        r_target = r_targets[0];
                    }else{
                        creep.memory.t = null;
                        r_target = null;
                    }
                // }
                if (r_target){
                    if (creep.repair(r_target) == ERR_NOT_IN_RANGE){
                        creep.moveTo(r_target);
                    }
                }

            }



            return;
        }
        creep.recycleNearby(); // 回收周围的能量

        if (creep.getEnergyState() == ENERGY_NEED){
            creep.clearTarget();
            if (creep.room.name == 'W37N55'){
                creep.obtainEnergy({
                    container: [CONTAINER_TYPE_SOURCE],
                });
            }else{
                creep.obtainEnergy({
                    storage: true,
                });
            }
        }else{
            if (creep.store[RESOURCE_ENERGY] == 0){
                creep.clearTarget();
                creep.setEnergyState(ENERGY_NEED);
                creep.obtainEnergy({
                    storage: true,
                });
            }
            let target;
            if (creep.getWorkState() == WORK_REPAIR){
                target = this.findRepairTarget(creep);
                if (target){
                    return this.repairTarget(creep, target);
                }
                target = this.findBuildTarget(creep);
                if (target){
                    return this.buildTarget(creep, target);
                }
                creep.goToStay();
                // creep.moveTo(28,29+creep.getIndex());
            }else{
                target = this.findBuildTarget(creep);
                if (target){
                    return this.buildTarget(creep, target);
                }
                target = this.findRepairTarget(creep);
                if (target){
                    return this.repairTarget(creep, target);
                }
                creep.goToStay();
                // creep.moveTo(27,29+creep.getIndex());
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
            return (s.structureType != STRUCTURE_WALL) && (s.hits < s.hitsMax);
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
};
