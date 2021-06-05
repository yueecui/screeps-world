import {
    ENERGY_NEED, ENERGY_ENOUGH,
    WORK_IDLE, WORK_TRANSPORTER_SPAWN, WORK_TRANSPORTER_TOWER, WORK_TRANSPORTER_STORAGE_ENERGY, WORK_TRANSPORTER_CONTROLLER,
    MODE_SPAWN, MODE_CONTROLLER, WORK_TRANSPORTER_STORAGE_MINERAL, WORK_TRANSPORTER_TOMBSTONE
} from '@/constant';

const IDLE_POS = { x: 28, y: 27 }

// 如果目标无视野，则先走到下面的位置
const MAP_POS: Record<string, [number,number]> = {
    'W34N57': [7, 21]
}


export const roleTransporter: Transporter = {
    run: function(creep: Creep) {
        if (creep.memory.room != undefined){
            this.otherRoom(creep);
        }else{
            this.updateStatus(creep);
            this.execute(creep);
        }
    },

    // 判断工作模式
    updateStatus: function(creep){
        // 优先级最高任务
        // 判断是否需要补充孵化能量
        // 会中断其他工作优先进行本工作
        if (creep.getMode() == MODE_CONTROLLER){
            if (creep.checkWorkTransporterStorage_Mineral()) return;
            if (creep.checkWorkTransporterController()) return;

            // 空闲下才会执行的任务
            if (creep.getWorkState() == WORK_IDLE){
                // if (creep.checkWorkTransporterController()) return;
                if (creep.checkWorkTransporterSpawn()) return;
                if (creep.checkWorkTransporterStorage_Energy()) return;
                if (creep.checkWorkTransporterTombstone()) return;
                if (creep.checkWorkTransporterTower()) return;
                // if (creep.checkWorkTransporterStorage_Mineral()) return;
            }
        }else {
            // if (creep.checkWorkTransporterTombstone()) return;
            if (creep.checkWorkTransporterSpawn()) return;

            // 空闲下才会执行的任务
            if (creep.getWorkState() == WORK_IDLE){
                if (creep.checkWorkTransporterTower()) return;
                if (creep.checkWorkTransporterStorage_Energy()) return;
                if (creep.checkWorkTransporterController()) return;
                // if (creep.checkWorkTransporterStorage_Mineral()) return;
            }
        }

    },

    // 根据工作模式执行
    execute: function(creep){
        if (creep.getWorkState() != WORK_TRANSPORTER_STORAGE_MINERAL){
            creep.recycleNearby(); // 回收周围的能量
        }

        switch(creep.getWorkState()){
            case WORK_TRANSPORTER_SPAWN:
                creep.doWorkTransporterSpawn();
                break;
            case WORK_TRANSPORTER_TOWER:
                creep.doWorkTransporterTower();
                break;
            case WORK_TRANSPORTER_CONTROLLER:
                creep.doWorkTransporterController();
                break;
            case WORK_TRANSPORTER_STORAGE_ENERGY:
                creep.doWorkTransporterStorage_Energy();
                break;
            case WORK_TRANSPORTER_STORAGE_MINERAL:
                creep.doWorkTransporterStorage_Mineral();
                break;
            case WORK_TRANSPORTER_TOMBSTONE:
                creep.doWorkTransporterTombstone();
                break;
            case WORK_IDLE:
                if (creep.store[RESOURCE_ENERGY] > 0){
                    creep.setEnergyState(ENERGY_ENOUGH);
                    creep.setWorkState(WORK_TRANSPORTER_STORAGE_ENERGY);
                }else{
                    creep.goToStay();
                }
                break;
            default:
                creep.setWorkState(WORK_IDLE);
        }
    },

    // ROOM外采集测试
    otherRoom: function(creep){
        creep.updateEnergyStatus();
        if (creep.getEnergyState() == ENERGY_ENOUGH){
            const link = Game.getObjectById('60b383415912304d8a2f1a7e' as Id<StructureLink>)!;
            if (creep.transfer(link, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                creep.moveTo(link);
            }
            if (creep.store.getUsedCapacity() == 0){
                creep.setEnergyState(ENERGY_NEED);
            }
        }else{
            creep.recycleNearby(); // 回收周围的能量

            const pos = MAP_POS[creep.memory.room];
            const move_target = new RoomPosition(pos[0], pos[1], creep.memory.room);

            if (creep.room.name != creep.memory.room){
                creep.moveTo(move_target);
                return;
            }

            for (const info of creep.room.memory.containers){
                const container = Game.getObjectById(info.id)!;
                if (container.store.getFreeCapacity() < 1200){
                    if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                        creep.moveTo(container);
                    }
                    return;
                }
            }

            if (creep.store[RESOURCE_ENERGY] > 800){
                creep.setEnergyState(ENERGY_ENOUGH);
            }

            creep.moveTo(move_target);
        }
    }
};


module.exports = roleTransporter;
