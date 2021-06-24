/**
 * 本模式主要是用来处理一些临时操作
 */

export default function (creep: Creep) {
    const cpu = Game.cpu.getUsed()
    if (creep.baseName == 'MA'){
        dismantle(creep);
    }else if (creep.baseName == 'MT'){
        transport(creep);
    }else{
        creep.say('呆');
    }
    console.log(creep.name, ':', Game.cpu.getUsed()-cpu);
}


const dismantle = function (creep: Creep) {
    const flag = Game.flags['MA_target'];
    if (!flag) {
        if (creep.room.name != creep.workRoom){
            creep.moveTo(new RoomPosition(25, 25, creep.workRoom), {visualizePathStyle:{}, reusePath: 50});
            return;
        }else{
            creep.say(ICON_QUESTION_MARK_1);
            return;
        }
    }else{
        if (creep.pos.isNearTo(flag)){
            let target;
            if (creep.target){
                target = Game.getObjectById(creep.target) as StructureRampart | null;
            }
            if (!target || !creep.pos.isNearTo(target)){
                target = _(flag.pos.lookFor(LOOK_STRUCTURES)).find({ structureType: STRUCTURE_RAMPART});
                if (target){
                    creep.target = target.id;
                }
            }
            if (!target){
                creep.say(ICON_QUESTION_MARK_1);
                return;
            }
            creep.dismantle(target);
        }else{
            const cpu = Game.cpu.getUsed();
            creep.moveTo(flag, {visualizePathStyle:{}, reusePath: 50});
            console.log(creep.name, '移动:', Game.cpu.getUsed()-cpu);
        }
    }
}

const transport = function (creep: Creep) {
    if (creep.mode == 0 && creep.store.getFreeCapacity() == 0){
        creep.mode = 1;
    }else if (creep.mode == 1 && creep.store.getUsedCapacity() == 0){
        if (creep.ticksToLive! < 400){
            creep.role = '回收';
            return;
        }
        creep.mode = 0;
    }
    if (creep.mode == 0){
        if (creep.room.name != creep.workRoom){
            creep.moveTo(new RoomPosition(25, 25, creep.workRoom), {visualizePathStyle:{}, reusePath: 50});
            return;
        }

        let target;
        if (creep.target){
            target = Game.getObjectById(creep.target);
        }
        if (!target){
            target = find_target(creep);
        }
        if (!target){
            creep.say(ICON_QUESTION_MARK_3);
            return;
        }
        if (creep.pos.isNearTo(target)){
            if (target instanceof Resource){
                creep.pickup(target);
            }else if (target instanceof Structure && 'store' in target){
                for (const name in (target as AnyStoreStructure).store){
                    if (name != RESOURCE_LEMERGIUM){
                        creep.withdraw(target as Structure, name as ResourceConstant);
                        return;
                    }
                }
            }
        }else{
            creep.moveTo(target, {visualizePathStyle:{}});
            return;
        }
        creep.say(ICON_QUESTION_MARK_2)
    }else{
        if (creep.room.name != creep.bornRoom){
            creep.moveTo(new RoomPosition(25, 25, creep.bornRoom), {visualizePathStyle:{}, reusePath: 50});
            return;
        }
        const target = creep.room.storage!;
        if (creep.pos.isNearTo(target)){
            for (const name in creep.store){
                creep.transfer(target, name as ResourceConstant);
                break;
            }
        }else{
            creep.moveTo(target);
        }
    }
}

const find_target = function (creep:Creep) {
    // , { filter: res=> res.amount>200 }
    const drop_resource = creep.room.find(FIND_DROPPED_RESOURCES);
    if (drop_resource.length > 0){
        return creep.pos.findClosestByRange(drop_resource);
    }
        // creep.target = target.id;
        // if (creep.pos.isNearTo(target)){
        //     creep.pickup(target);
        // }else{
        //     creep.moveTo(target);
        // }
    const store_structure = creep.room.find(FIND_STRUCTURES, { filter: str=> str.structureType != STRUCTURE_STORAGE && 'store' in str && str.store[RESOURCE_ENERGY] > 0});
    if (store_structure.length > 0){
        return creep.pos.findClosestByRange(store_structure);
    }

    return creep.room.storage;
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
    new RoomPosition(2, 11,  'W42N51'),
    new RoomPosition(18, 47,  'W42N51'),
    new RoomPosition(11, 12,  'W42N50'),
    new RoomPosition(25, 25,  'W43N50'),
    new RoomPosition(25, 25,  'W44N50'),
    new RoomPosition(25, 25,  'W45N50'),
    new RoomPosition(26, 45,  'W46N50'),
    new RoomPosition(24, 6,  'W46N49'),
]

// 以前的脚本
const execute = function(creep: Creep){
    if (creep.memory.room != 'W46N49'){
        return;
    }
    if (creep.memory.work < pos_order.length){
        const pos = pos_order[creep.memory.work];
        if (pos){
            if (creep.pos.getRangeTo(pos) == 0){
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
                    creep.role = '回收';
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
            // found.sort((a,b) => {
            //     return creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b);
            // })
            if (found.length){
                if (creep.build(found[0]) == ERR_NOT_IN_RANGE){
                    creep.moveTo(found[0]);
                }
            }else{
                Memory.rooms[creep.bornRoom].spawnConfig.amount.MB = 0;
                Memory.rooms[creep.bornRoom].spawnConfig.amount.MC = 0;
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
