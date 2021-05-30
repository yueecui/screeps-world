// 建筑工
// 具有2组指令，一组建造，一组修理
// model为B的优先建造，没有可建造的时修理
// model为R的优先修理，没有可修理的时候建造

// 修理一旦开始就会修完

import {
    ENERGY_NEED,
    WORK_IDLE, WORK_BUILD, WORK_REPAIR,
    MODE_BUILDER, MODE_REPAIRER } from "@/constant";

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
        // 临时
        if (creep.memory.flag && Game.flags[creep.memory.flag]){
            const flag = Game.flags[creep.memory.flag];
            // if (!creep.pos.isNearTo(flag)){
            //     creep.moveTo(flag);
            // }

            creep.updateEnergyStatus();

            if (creep.getEnergyState() == ENERGY_NEED){
                if (creep.room.name != 'W35N57'){
                    creep.moveTo(Game.rooms['W35N57']!.storage!);
                }else{
                    creep.clearTarget();
                    creep.obtainEnergy({
                        storage: true,
                    });
                }

            }else{
                if (creep.room.name != 'W34N57'){
                    creep.moveTo(flag);
                    return;
                }
                // 寻找一个可以修理的目标
                let targets = flag.pos.findInRange(FIND_STRUCTURES, 5, { filter: function(s){
                    return (s.structureType == STRUCTURE_ROAD) && (s.hits < s.hitsMax);
                }})
                let target;
                // const last_target = targets.filter((s) => { return s.id == creep.memory.t; });
                // if (last_target[0]){
                //     target = last_target[0];
                // }else{
                    targets = targets.filter((s) => {
                        return (s.hits/s.hitsMax) < REPAIR_PERCENT}
                    )
                    targets.sort((a, b) => {
                        return (a.hits/a.hitsMax - b.hits/b.hitsMax)
                        // return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
                    })

                    if (targets[0]){
                        creep.memory.t = targets[0].id;
                        target = targets[0];
                    }else{
                        creep.memory.t = null;
                        target = null;
                    }
                // }
                if (target){
                    if (creep.repair(target) == ERR_NOT_IN_RANGE){
                        creep.moveTo(target);
                    }
                }

            }



            return;
        }
        creep.recycleNearby(); // 回收周围的能量

        if (creep.getEnergyState() == ENERGY_NEED){
            creep.clearTarget();
            creep.obtainEnergy({
                storage: true,
            });
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
