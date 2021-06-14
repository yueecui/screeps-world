import { CONTAINER_TYPE_SOURCE, ENERGY_ENOUGH, ENERGY_NEED, MODE_NONE } from "@/global/constant";

/**
 * 本模式主要是用来处理一些临时操作
 */

export default function (creep: Creep) {
    if (creep.roomCode == 'R3' && (creep.mode == 0 || creep.mode == 1)){
        execute(creep);
        return;
    }
    if (creep.baseName == 'MA'){
        if (creep.bornRoom == 'W41N54'){
            r3_claim(creep)
        }else{
            attack_temp(creep);
        }
    }else if (creep.room.code == 'R2'){
        r4temp(creep);
    }else{
        creep.say('呆');
    }
}

// 临时
const attack_temp = function(creep: Creep){
    const flag = Game.flags['attack'];

     if (creep.room.name != creep.memory.room){
        const pos = new RoomPosition(25, 25, creep.memory.room);
        creep.moveTo(pos, {reusePath:50, visualizePathStyle: {}});
        return;
    }else{
        if (flag) {
            if (creep.room.name == flag.pos.roomName){
                creep.memory.room = creep.room.name;
            }
            {
                const look = flag.pos.lookFor(LOOK_STRUCTURES);
                if (look[0]){
                    if (creep.pos.isNearTo(look[0])){
                        creep.attack(look[0]);
                    }else{
                        creep.moveTo(look[0]);
                    }
                    return;
                }
            }
            {
                const found = flag.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
                if (found.length){
                    const target = creep.pos.findClosestByRange(found)!;
                    if (creep.pos.isNearTo(target)){
                        creep.attack(target);
                    }else{
                        creep.moveTo(target);
                    }
                    return;
                }
            }
        }

        const found = creep.room.find(FIND_HOSTILE_SPAWNS);
        if (found.length){
            const target = found[0]
            if (creep.pos.isNearTo(target)){
                creep.attack(target);
            }else{
                creep.moveTo(target);
            }
            return;
        }
    }
    if (flag) {
        if (creep.room.name == flag.pos.roomName){
            creep.memory.room = creep.room.name;
        }
    }

    creep.role = '回收';
}

// R3临时搬运
const r3temp = function(creep: Creep){
    const storage = creep.room.storage;
    const terminal = creep.room.terminal;
    if (!storage) return;
    if (!terminal) return;
    if (storage.store.getUsedCapacity() == 0 && creep.store.getUsedCapacity() == 0){
        return;
    }
    if (terminal.store.getFreeCapacity() == 0)  return;
    if (creep.store.getUsedCapacity() > 0){
        if (creep.pos.isNearTo(terminal)){
            for (const name in creep.store){
                creep.transfer(terminal, name as ResourceConstant);
                break;
            }
        }else{
            creep.moveTo(terminal);
        }
    }else{
        if (creep.pos.isNearTo(storage)){
            for (const name in storage.store){
                if (name == RESOURCE_ENERGY) continue;
                creep.withdraw(storage, name as ResourceConstant);
                return;
            }
            if (storage.store[RESOURCE_ENERGY] > 0){
                creep.withdraw(storage, RESOURCE_ENERGY);
                return;
            }
        }else{
            creep.moveTo(storage);
        }
    }
}

// 临时搬运
const r4temp = function(creep: Creep){
    if (creep.ticksToLive! < 60 && creep.store.getUsedCapacity() == 0){
        creep.role = '回收';
    }

    const to = creep.room.storage;
    const from = creep.room.terminal;
    if (!from) return;
    if (!to) return;
    if (from.store.getUsedCapacity() == 0 && creep.store.getUsedCapacity() == 0){
        return;
    }
    if (to.store.getFreeCapacity() == 0)  return;

    if (creep.store.getFreeCapacity() > 0 && from.store.getUsedCapacity() > 0){
        if (!creep.pos.isNearTo(to)){
            if (creep.pos.isNearTo(from)){
                for (const name in from.store){
                    if (name == RESOURCE_ENERGY) continue;
                    creep.withdraw(from, name as ResourceConstant);
                    return;
                }
            }else{
                creep.moveTo(from);
                return;
            }
        }
    }

    if (creep.pos.isNearTo(to)){
        if (creep.store.getUsedCapacity() > 0){
            for (const name in creep.store){
                creep.transfer(to, name as ResourceConstant);
                break;
            }
        }else{
            creep.moveTo(from);
        }
    }else{
        creep.moveTo(to);
    }
}


const pos_order = [
    new RoomPosition(12, 2,  'W42N50'),
    new RoomPosition(24, 6,  'W46N49'),
]

// 以前的脚本
const execute = function(creep: Creep){
    if (creep.memory.room != 'W46N49'){
        return;
    }
    if (creep.memory.work < 2){
        const pos = pos_order[creep.memory.node];
        if (pos){
            if (creep.pos.isNearTo(pos)){
                creep.memory.work += 1;
            }else{
                creep.moveTo(pos, {reusePath: 50, visualizePathStyle:{}});
            }
        }
        return;
    }
    if (creep.mode == 1){
        const controller = creep.room.controller!;
        if (creep.pos.isNearTo(controller)){
            if (!controller.sign){
                creep.signController(controller, '别打我，我是菜狗~don\'t attack me, i\'m newbie.')
            }else{
                if (creep.claimController(controller) == OK){
                    creep.memory.r = '回收';
                }
            }
        }else{
            creep.moveTo(controller);
        }
    }else{
        creep.recycleNearby(); // 回收周围的能量
        creep.updateEnergyStatus();
        if (creep.energy == ENERGY_NEED){
            const found = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: (stru)=> {return 'store' in stru && stru.store[RESOURCE_ENERGY] > 0;}})
            if (found.length){
                const target = creep.pos.findClosestByRange(found);
                if (target){
                    if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                        creep.moveTo(target);
                    }
                    return;
                }
            }

            if (creep.room.countBaseNameCreeps('GA', 'GB') == 2){
                creep.obtainEnergy({
                    container: [CONTAINER_TYPE_SOURCE],
                    storage: false,
                });
            }else{
                const source_info = creep.room.sources[creep.memory.node];
                const target = Game.getObjectById(source_info.id)!;
                if (creep.pos.isNearTo(target)){
                    creep.harvest(target);
                }else{
                    creep.moveTo(target);
                }
            }
        }else{
            // const controller = creep.room.controller!;
            // if (creep.memory.node == 0 && controller.level == 2){
            //     if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE){
            //         creep.moveTo(controller);
            //     }
            //     return;
            // }

            const found = creep.room.find(FIND_CONSTRUCTION_SITES);
            found.sort((a,b) => {
                return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
            })
            if (found.length){
                if (creep.build(found[0]) == ERR_NOT_IN_RANGE){
                    creep.moveTo(found[0]);
                }
            }else{
                creep.say('❓');
            }
        }
    }
}

const r3_claim = function(creep: Creep){
    if (Memory.tempFlags.spawnClaim == 1){
        Memory.tempFlags.lastClaim = Game.time;
        Memory.tempFlags.spawnClaim = 0;
        creep.mode = 0;
    }
    if (creep.mode == 0){
        if (creep.pos.roomName != 'W40N45'){
            const target = new RoomPosition(25, 25, 'W40N45');
            creep.moveTo(target, {reusePath: 50, visualizePathStyle: {}});
            return;
        }else{
            creep.mode = 1;
        }
    }
    if (creep.pos.roomName != 'W38N45'){
        const target = new RoomPosition(34, 7, 'W38N45');
        creep.moveTo(target, {reusePath: 50, visualizePathStyle: {}});
    }else{
        const target = creep.room.controller!;
        if (creep.pos.isNearTo(target)){
            if (target.sign?.username != 'Yuee'){
                creep.signController(target, '这ROOM归我啦！');
                return;
            }
            if (creep.attackController(target) == ERR_TIRED){
                if (target.level == 1 && target.ticksToDowngrade < 1000){
                    Game.rooms[creep.bornRoom].memory.spawnConfig.amount.MA = 0;
                    Game.notify(`攻击计数器结束，当前级别${target.level}，下次降级${target.ticksToDowngrade} ticks后，停止刷新`)
                }else{
                    Game.notify(`攻击计数器结束，当前级别${target.level}，下次降级${target.ticksToDowngrade} ticks后`)
                }
                creep.suicide();
            };
        }else{
            creep.moveTo(target);
        }

    }
}
