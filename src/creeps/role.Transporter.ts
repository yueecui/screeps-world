import {
    ENERGY_NEED, ENERGY_ENOUGH,
    WORK_IDLE, WORK_TRANSPORTER_SPAWN, WORK_TRANSPORTER_TOWER, WORK_TRANSPORTER_STORAGE
} from '@/constant';

const CONTAINER_TO_STORAGE_MIN = 1500;

const IDLE_POS = { x: 28, y: 27 }

export const roleTransporter: Transporter = {
    run: function(creep: Creep) {
        creep.recycleNearby(); // 回收周围的能量
        creep.updateEnergyStatus();
        this.updateStatus(creep);
        this.execute(creep);
    },
    // 判断能量需求状况
    // updateEnergy: function(creep){
    //     if (creep.memory.e == ENERGY_NEED){
    //         if (creep.store.getFreeCapacity() == 0){
    //             creep.memory.e = ENERGY_ENOUGH;
    //         }else{
    //             const target =  creep.getTarget();
    //             if (target && target.store[RESOURCE_ENERGY] == 0){
    //                 creep.memory.e = ENERGY_ENOUGH;
    //                 creep.clearTarget();
    //             }
    //         }
    //     }else if (creep.memory.e == ENERGY_ENOUGH && creep.store[RESOURCE_ENERGY] == 0){
    //         creep.memory.e = ENERGY_NEED;
    //     }
    // },
    // 判断工作模式
    updateStatus: function(creep){
        // 优先级最高任务
        // 判断是否需要补充孵化能量
        // 会中断其他工作优先进行本工作
        creep.checkWorkTransporterSpawn();

        // 空闲下才会执行的任务
        if (creep.memory.w == WORK_IDLE){
            // 判断是否需要给塔补充能量
            const find_tower = creep.room.find(FIND_MY_STRUCTURES, {filter: (structure) => {
                return structure.structureType == STRUCTURE_TOWER && structure.store[RESOURCE_ENERGY] < 1000;
            }});
            // console.log(JSON.stringify(find_tower));
            if (find_tower.length){
                creep.memory.t = find_tower[0].id;
                creep.memory.w = WORK_TRANSPORTER_TOWER;
                return;
            }

            // 判断是否运送能量到storage
            if (creep.room.storage){
                const find_containers = creep.room.find(FIND_STRUCTURES, {filter: function(st){
                    return (st.structureType == STRUCTURE_CONTAINER && st.storeCapacity && st.store[RESOURCE_ENERGY] > CONTAINER_TO_STORAGE_MIN)
                }});
                if (find_containers.length > 0){
                    find_containers.sort((a, b) => {
                        return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
                    });
                    creep.memory.t = find_containers[0].id;
                    creep.memory.w = WORK_TRANSPORTER_STORAGE;
                    if (creep.store.getFreeCapacity() > 0){
                        creep.memory.e = ENERGY_NEED;
                    }
                }
            }
        }
    },
    execute: function(creep){
        if (creep.memory.e == ENERGY_NEED && creep.isRecycling()){
            return;
        }

        if (creep.memory.w == WORK_TRANSPORTER_SPAWN){
            const target = this.findStore(creep);
            if (target){
                if (creep.store.getFreeCapacity() > 0 && (target.store.getFreeCapacity(RESOURCE_ENERGY) > creep.store[RESOURCE_ENERGY])){
                    creep.memory.e = ENERGY_NEED;
                    this.obtainEnergy(creep)
                }else{
                    const result = creep.transfer(target, RESOURCE_ENERGY);
                    switch(result){
                        case OK:
                        case ERR_FULL:
                            creep.memory.w = WORK_IDLE;
                            break;
                        case ERR_NOT_IN_RANGE:
                            creep.moveTo(target);
                            break;
                    }
                }
            }
        }else if (creep.memory.w == WORK_TRANSPORTER_TOWER){
            const target = creep.getTarget();
            if (creep.memory.e == ENERGY_NEED){
                this.obtainEnergy(creep)
            }else{
                const result = creep.transfer(target, RESOURCE_ENERGY);
                switch(result){
                    case OK:
                    case ERR_FULL:
                        creep.memory.w = WORK_IDLE;
                        break;
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(target);
                        break;
                }
            }
        }else if (creep.memory.w == WORK_TRANSPORTER_STORAGE){
            const target = creep.getTarget();
            if (creep.memory.e == ENERGY_NEED){
                const result = creep.withdraw(target, RESOURCE_ENERGY);
                switch(result){
                    case OK:
                        creep.memory.e = ENERGY_ENOUGH;
                        break;
                    case ERR_NOT_ENOUGH_RESOURCES:
                        creep.memory.w = WORK_IDLE;
                        break;
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(target);
                        break;
                }
            }else{
                const result = creep.transfer(creep.room.storage!, RESOURCE_ENERGY);
                switch(result){
                    case OK:
                    case ERR_FULL:
                        creep.memory.w = WORK_IDLE;
                        break;
                    case ERR_NOT_IN_RANGE:
                        creep.moveTo(creep.room.storage!);
                        break;
                }
            }
        }else if (creep.memory.w == WORK_IDLE){
            if (creep.store[RESOURCE_ENERGY] > 0){
                creep.memory.e = ENERGY_ENOUGH;
                creep.memory.w = WORK_TRANSPORTER_STORAGE;
            }else if (creep.pos.x != IDLE_POS.x || creep.pos.y != IDLE_POS.y ){
                creep.moveTo(IDLE_POS.x, IDLE_POS.y);
            }
        }
    },

    obtainEnergy: function(creep){
        if (creep.isRecycling()){
            return;
        }
        const container = Game.getObjectById('60aa044fea027425aec64b83' as Id<StructureContainer>);
        if (creep.memory.e == ENERGY_NEED){
            const stores: Array<StructureContainer|StructureStorage> = [container!, creep.room.storage!];
            stores.sort((a,b) => {
                return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
            })
            if(creep.withdraw(stores[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(stores[0]);
            }
        }else if (creep.store.getFreeCapacity() > 0){
            if (creep.pos.isNearTo(container!)){
                creep.withdraw(container!, RESOURCE_ENERGY);
            }
        }
    },

    findStore: function(creep){
        const sites = creep.room.find(FIND_MY_STRUCTURES).filter((s) => { return s.structureType == STRUCTURE_EXTENSION && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0; });
        sites.sort((a,b) => {
            return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
        })
        if (sites.length){
            return sites[0] as StructureExtension;
        }
        if (Game.spawns['Spawn1'].store.getFreeCapacity(RESOURCE_ENERGY) > 0){
            return Game.spawns['Spawn1'];
        }
        return null;
    },
};


module.exports = roleTransporter;
