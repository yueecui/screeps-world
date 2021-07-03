// 建筑工
// 具有2组指令，一组建造，一组修理
// model为B的优先建造，没有可建造的时修理
// model为R的优先修理，没有可修理的时候建造

// 修理一旦开始就会修完

import {
    ENERGY_NEED,
    WORK_IDLE, WORK_BUILD, WORK_REPAIR,
    MODE_BUILDER, MODE_REPAIRER, CONTAINER_TYPE_SOURCE, ENERGY_ENOUGH, PRIORITY_STORAGE } from "@/common/constant";

const REPAIR_PERCENT = 0.7;  // 耐久度低到什么程度开始修理

export default function (creep: Creep) {
    updateStatus(creep);
    execute(creep);
}


// 判断工作模式
const updateStatus = function(creep: Creep){
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
}

// 根据工作模式执行
const execute = function(creep: Creep){
    if (creep.memory.room && creep.room.name != creep.memory.room){
        creep.moveTo(new RoomPosition(25, 25, creep.memory.room));
        return;
    }else if (creep.room.name != creep.workRoom){
        creep.moveTo(new RoomPosition(25, 25, creep.workRoom))
        return;
    }
    if (creep.pos.y == 49){
        creep.move(TOP);
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
        if (creep.room.name == 'W35N57'){
            creep.obtainEnergy({
                storage: true,
                terminal: true,
                // priority: PRIORITY_STORAGE
            });
            return;
        }
        if (creep.room.storage){
            creep.obtainEnergy({
                storage: true,
                // terminal: true,
                // priority: PRIORITY_STORAGE
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
            // terminal: true,
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
            target = findRepairTarget(creep);
            if (target){
                return repairTarget(creep, target);
            }
            target = findBuildTarget(creep);
            if (target){
                return buildTarget(creep, target);
            }
            target = findRepairWall(creep);
            if (target){
                return repairTargetWall(creep, target);
            }
            target = findRepairRampart(creep);
            if (target){
                return repairTargetRampart(creep, target);
            }
            creep.target = null;
            creep.goToStay();
        }else{
            target = findBuildTarget(creep);
            if (target){
                return buildTarget(creep, target);
            }
            target = findRepairTarget(creep);
            if (target){
                return repairTarget(creep, target);
            }
            if (creep.memory.room){
                creep.role = '回收';
            }else{
                creep.target = null;
                creep.goToStay();
            }
        }
    }
}

// 寻找一个可以建造的目标
const findBuildTarget = function(creep: Creep){
    const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
    const last_target = targets.filter((s) => {return s.id == creep.memory.t});
    if (last_target[0]){
        return last_target[0];
    }else{
        if (targets[0]){
            creep.memory.t = targets[0].id;
            return targets[0];
        }else{
            return null;
        }
    }
}

// 建造目标
const buildTarget = function(creep: Creep, target: ConstructionSite){
    if(creep.build(target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target);
    }
}

// 寻找一个可以修理的目标
const findRepairTarget = function(creep: Creep){
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
            return null;
        }
    }
}

// 修理目标
const repairTarget = function(creep: Creep, target: AnyStructure){
    if (creep.repair(target) == ERR_NOT_IN_RANGE){
        creep.moveTo(target);
    }
}

// 寻找一个可以修理的目标
const findRepairWall = function(creep: Creep){
    const wallHp = creep.room.memory.roomConfig?.wallHp ?? 100;
    let targets = creep.room.find(FIND_STRUCTURES, { filter: function(s){
        return s.structureType == STRUCTURE_WALL && s.hits < wallHp * 1000;
    }}) as StructureWall[];
    const last_target = targets.filter((s) => { return s.id == creep.memory.t as Id<StructureWall>; });
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
            return null;
        }
    }
}

// 修理目标
const repairTargetWall = function(creep: Creep, target: StructureWall){
    const wallHp = creep.room.memory.roomConfig?.wallHp ?? 100;
    if (target.hits >= wallHp * 1000){
        creep.target = null;
        return;
    }
    if (creep.repair(target) == ERR_NOT_IN_RANGE){
        creep.moveTo(target);
    }
}

// 寻找一个可以修理的目标
const findRepairRampart = function(creep: Creep){
    const rampartHpMin = creep.room.memory.roomConfig?.rampartHpMin ?? 50;
    const rampartHpMax = creep.room.memory.roomConfig?.rampartHpMax ?? 100;
    const target = Game.getObjectById(creep.target!) as StructureRampart | null;
    if (target && target.structureType == STRUCTURE_RAMPART && target.hits < rampartHpMax * 1000){
        return target;
    }

    let targets = creep.room.find(FIND_STRUCTURES, { filter: function(s){
        return s.structureType == STRUCTURE_RAMPART && s.hits < rampartHpMin * 1000;
    }}) as StructureRampart[];

    if (targets[0]){
        targets.sort((a, b) => {
            return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
        })
        creep.memory.t = targets[0].id;
        return targets[0];
    }else{
        return null;
    }
}

// 修理目标
const repairTargetRampart = function(creep: Creep, target: StructureRampart){
    const rampartHpMax = creep.room.memory.roomConfig?.rampartHpMax ?? 100;
    if (target.hits >= rampartHpMax * 1000){
        creep.target = null;
        return;
    }
    if (creep.repair(target) == ERR_NOT_IN_RANGE){
        creep.moveTo(target);
    }
}
