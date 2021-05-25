// 建筑工
// 具有2组指令，一组建造，一组修理
// model为B的优先建造，没有可建造的时修理
// model为R的优先修理，没有可修理的时候建造

// 修理一旦开始

const WORK_OBTAIN_ENERGY = 0;
const WORK_DOING = 1;

const REPAIR_PERCENT = 0.7;  // 耐久度低到什么程度开始修理

export const roleBuilder: Builder = {
    run: function(creep) {
        creep.recycleNearby(); // 回收周围的能量
        this.updateWorkStatus(creep);
        this.execute(creep);
	},
    // 根据能量状态切换工作模式
    updateWorkStatus: function(creep){
        if (creep.memory.w == WORK_OBTAIN_ENERGY && creep.store.getFreeCapacity() == 0){
            creep.memory.w = WORK_DOING;
        }else if (creep.memory.w == WORK_DOING && creep.store[RESOURCE_ENERGY] == 0){
            creep.memory.w = WORK_OBTAIN_ENERGY;
        }
    },
    execute: function(creep){
        if (creep.memory.w == WORK_OBTAIN_ENERGY){
            if (creep.room.storage){
                if(creep.withdraw(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.storage);
                }
            }else{
                creep.obtainEnergyFromNearestContainer(500);
            }
        }else if (creep.memory.w == WORK_DOING){
            let target;
            // if (creep.pos.x == 33 && creep.pos.y == 35){
            //     creep.moveTo(32, 34);
            // }
            if (creep.memory.model == 'R'){
                target = this.findRepairTarget(creep);
                if (target){
                    return this.repairTarget(creep, target);
                }
                target = this.findBuildTarget(creep);
                if (target){
                    return this.buildTarget(creep, target);
                }
                creep.moveTo(28,29+creep.getIndex());
            }else{
                target = this.findBuildTarget(creep);
                if (target){
                    return this.buildTarget(creep, target);
                }
                target = this.findRepairTarget(creep);
                if (target){
                    return this.repairTarget(creep, target);
                }
                creep.moveTo(27,29+creep.getIndex());
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
