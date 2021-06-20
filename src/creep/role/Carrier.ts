import {
    ENERGY_NEED, ENERGY_ENOUGH,
    WORK_IDLE, WORK_TRANSPORTER_SPAWN, WORK_TRANSPORTER_TOWER, WORK_TRANSPORTER_STORAGE_ENERGY, WORK_TRANSPORTER_CONTROLLER,
    MODE_SPAWN, MODE_CONTROLLER, WORK_TRANSPORTER_STORAGE_MINERAL, WORK_TRANSPORTER_TOMBSTONE, BOOLEAN_TRUE
} from '@/common/constant';

const IDLE_POS = { x: 28, y: 27 }

// 如果目标无视野，则先走到下面的位置
const MAP_POS: Record<string, [number,number]> = {
    'W34N57': [7, 21]
}

export default function (creep: Creep) {
    if (creep.memory.room != undefined){
        otherRoom(creep);
    }else{
        updateStatus(creep);
        execute(creep);
    }
}

// 判断工作模式
const updateStatus = function(creep: Creep){
    // 优先级最高任务
    // 判断是否需要补充孵化能量
    // 会中断其他工作优先进行本工作
    if (creep.mode == MODE_CONTROLLER){
        if (creep.checkWorkTransporterStorage_Mineral()) return;
        if (creep.checkWorkTransporterController()) return;

        // 空闲下才会执行的任务
        if (creep.work == WORK_IDLE){
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
        if (creep.work == WORK_IDLE){
            if (creep.checkWorkTransporterTower()) return;
            if (creep.checkWorkTransporterStorage_Energy()) return;
            if (creep.checkWorkTransporterController()) return;
            // if (creep.checkWorkTransporterStorage_Mineral()) return;
        }
    }
}

// 根据工作模式执行
const execute = function(creep: Creep){
    if (creep.work != WORK_TRANSPORTER_STORAGE_MINERAL){
        creep.recycleNearby(); // 回收周围的能量
    }

    switch(creep.work){
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
                creep.energy = ENERGY_ENOUGH;
                creep.work = WORK_TRANSPORTER_STORAGE_ENERGY;
            }else{
                creep.goToStay();
            }
            break;
        default:
            creep.work = WORK_IDLE;
    }
}

// ROOM外采集测试
const otherRoom = function(creep: Creep){
    creep.updateEnergyStatus();
    if (creep.energy == ENERGY_ENOUGH){
        if (creep.room.name != creep.bornRoom){
            const room = Game.rooms[creep.bornRoom];
            if (!room || !room.storage) { creep.say('⁉️');return; }
            creep.moveTo(room.storage);
            return;
        }

        const stores: Array<StructureStorage|StructureLink> = [creep.room.storage!]
        if (creep.room.name == 'W35N57'){
            stores.push(Game.getObjectById('60b383415912304d8a2f1a7e' as Id<StructureLink>)!)
        }
        const target = creep.pos.findClosestByRange(stores)!;
        if (creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
            creep.moveTo(target);
        }
        if (creep.store.getUsedCapacity() == 0){
            creep.energy = ENERGY_NEED;
        }
    }else{
        creep.recycleNearby(); // 回收周围的能量

        const pos = MAP_POS[creep.memory.room];
        const move_target = new RoomPosition(pos[0], pos[1], creep.memory.room);

        if (creep.room.name != creep.memory.room){
            creep.moveTo(move_target);
            return;
        }

        const containers: StructureContainer[] = []
        for (const info of creep.room.containers){
            const container = Game.getObjectById(info.id)!;
            if (container){
                if (container.store.getFreeCapacity() < 1200){
                    containers.push(container);
                }
            }else{
                creep.room.memory.flagPurge = BOOLEAN_TRUE;
            }
        }
        containers.sort((a, b) => { return b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY]; })
        if (containers[0]){
            if (creep.withdraw(containers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                creep.moveTo(containers[0]);
            }
            return;
        }

        if (creep.bornRoom == 'W35N57'){
            if (creep.store[RESOURCE_ENERGY] > 800){
                creep.energy = ENERGY_ENOUGH;
            }
            creep.moveTo(move_target);
        }else if (creep.store.getFreeCapacity() == 0){
            creep.energy = ENERGY_ENOUGH;
        }
    }
}
