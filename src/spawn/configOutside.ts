/**
 * 房间外矿虫子配置
 */

import { SPAWN_TYPE_OUTSIDE, MODE_BUILDER, MODE_HARVEST_ENERGY, MODE_HARVEST_MINERAL, MODE_HELP, MODE_REPAIRER, MODE_SPAWN, TRUE, FALSE, MODE_OUTSIDE } from "@/common/constant";
import { BodyGenerator } from './bodyGenerator';


/** 外矿防御者 */
const role_DE: SpawnConfig = {
    type: SPAWN_TYPE_OUTSIDE,
    baseName: 'DE',
    advance: false,
    memory: (spawn_room, work_room_name) => {
        return {
            room: work_room_name,
            role: '攻击'
        }
    },
    amount: function(spawn_room, work_room_name) {
        if (work_room_name && Memory.rooms[work_room_name]){
            let amount = Memory.rooms[work_room_name].spawnConfig.amount[this.baseName];
            if (amount != null) return amount;
        }
        return 1;
    },
    isLive: (spawn_room, creep) => {
        return true;
    },
    needSpawn: (spawn_room, work_room_name) => {
        // 需要目标房间遭到攻击
        // 由于不一定有视野，所以通过Memory判断
        if (work_room_name && Memory.rooms[work_room_name]){
            return Memory.rooms[work_room_name].status.underAttack == TRUE
                || Memory.rooms[work_room_name].status.hasInvaderCore == TRUE;
        }
        return false;
    },
    body: BodyGenerator.OutsideDefender
}

/** 斥候 */
const role_SC: SpawnConfig = {
    type: SPAWN_TYPE_OUTSIDE,
    baseName: 'SC',
    advance: false,
    memory: (spawn_room, work_room_name) => {
        return {
            room: work_room_name,
            role: '斥候'
        }
    },
    amount: function(spawn_room, work_room_name) {
        return 1;
    },
    isLive: (spawn_room, creep) => {
        return true;
    },
    needSpawn: (spawn_room, work_room_name) => {
        // 目标房间无视野时就会刷新
        return work_room_name && Game.rooms[work_room_name] == undefined ? true : false;
    },
    body: (spawn_room) =>{
        return [MOVE];
    }
}

/** 外矿预定者 */
const role_ENG: SpawnConfig = {
    type: SPAWN_TYPE_OUTSIDE,
    baseName: 'ENG',
    advance: true,
    memory: (spawn_room, work_room_name) => {
        return {
            room: work_room_name,
            role: '工兵'
        }
    },
    amount: function(spawn_room, work_room_name) {
        if (work_room_name && Memory.rooms[work_room_name]){
            let amount = Memory.rooms[work_room_name].spawnConfig.amount[this.baseName];
            if (amount != null) return amount;
        }
        return 1;
    },
    isLive: (spawn_room, creep) => {
        return true;
    },
    needSpawn: (spawn_room, work_room_name) => {
        // 目标房间没有视野时不生成，先生成斥候
        if (!work_room_name) return false;
        const room = Game.rooms[work_room_name];
        // 以下情况不刷新
        // 1.目标房间没有控制器
        // 2.已被其他人占领
        // 3.处于攻击状态
        if (!room
            || !room.controller
            || room.controller.owner != undefined
            || room.isUnderAttack) return false;
        return true;
    },
    body: BodyGenerator.OutsideReserver
}

/** 外矿的建造的建设者 */
const role_BB: SpawnConfig = {
    type: SPAWN_TYPE_OUTSIDE,
    baseName: 'BB',
    advance: false,
    memory: (spawn_room, work_room_name) => {
        return {
            room: work_room_name,
            role: '建造',
            mode: MODE_BUILDER
        }
    },
    amount: function(spawn_room, work_room_name) {
        if (work_room_name && Memory.rooms[work_room_name]){
            let amount = Memory.rooms[work_room_name].spawnConfig.amount[this.baseName];
            if (amount != null) return amount;
        }
        return 1;
    },
    isLive: (spawn_room, creep) => {
        return true;
    },
    needSpawn: (spawn_room, work_room_name) => {
        // 目标房间没有视野时不生成，先生成斥候
        if (!work_room_name) return false;
        const room = Game.rooms[work_room_name];
        // 以下情况不刷新
        // 1.目标房间没有控制器
        // 2.已被其他人占领
        // 3.房间不是我预定的
        // 4.处于攻击状态
        if (!room
            || !room.controller
            || room.controller.owner != undefined
            || !room.myReserve
            || room.isUnderAttack) return false;

        const found = room.find(FIND_MY_CONSTRUCTION_SITES);
        return found.length > 0 ? true : false;
    },
    body: BodyGenerator.Builder
}

/** 外矿能量采集者A */
const role_GA: SpawnConfig = {
    type: SPAWN_TYPE_OUTSIDE,
    baseName: 'GA',
    advance: true,
    memory: (spawn_room, work_room_name) => {
        return {
            room: work_room_name,
            role: '采集',
            mode: MODE_HARVEST_ENERGY,
            node: 0
        }
    },
    amount: function(spawn_room, work_room_name) {
        if (work_room_name && Memory.rooms[work_room_name]){
            let amount = Memory.rooms[work_room_name].spawnConfig.amount[this.baseName];
            if (amount != null) return amount;
        }
        return 1;
    },
    isLive: (spawn_room, creep) => {
        return true;
    },
    needSpawn: (spawn_room, work_room_name) => {
        // 目标房间没有视野时不生成，先生成斥候
        if (!work_room_name) return false;
        const room = Game.rooms[work_room_name];
        // 以下情况不刷新
        // 1.目标房间没有控制器
        // 2.已被其他人占领
        // 3.房间不是我预定的
        // 4.处于攻击状态
        // 5.采集点0没有container
        // 6.房间还有修建者
        if (!room
            || !room.controller
            || room.controller.owner != undefined
            || !room.myReserve
            || room.isUnderAttack
            || room.sources[0].container == null
            || room.countBaseNameCreeps('BB') > 0) return false;
        return true;
    },
    body: (room) =>{
        return BodyGenerator.OutsideEnergyHarvester(room);
    }
}

/** 外矿能量采集者B */
const role_GB: SpawnConfig = {
    type: SPAWN_TYPE_OUTSIDE,
    baseName: 'GB',
    advance: true,
    memory: (spawn_room, work_room_name) => {
        return {
            room: work_room_name,
            role: '采集',
            mode: MODE_HARVEST_ENERGY,
            node: 1
        }
    },
    amount: function(spawn_room, work_room_name) {
        if (work_room_name && Memory.rooms[work_room_name]){
            let amount = Memory.rooms[work_room_name].spawnConfig.amount[this.baseName];
            if (amount != null) return amount;
        }
        // 房间有第二个矿时，才需要
        if (work_room_name
            && Memory.rooms[work_room_name]
            && Memory.rooms[work_room_name].data.sources.length > 1){
                return 1
        }
        return 0;
    },
    isLive: (spawn_room, creep) => {
        return true;
    },
    needSpawn: (spawn_room, work_room_name) => {
        // 目标房间没有视野时不生成，先生成斥候
        if (!work_room_name) return false;
        const room = Game.rooms[work_room_name];
        // 以下情况不刷新
        // 1.目标房间没有控制器
        // 2.已被其他人占领
        // 3.房间不是我预定的
        // 4.处于攻击状态
        // 5.采集点1没有container
        // 6.房间还有修建者
        if (!room
            || !room.controller
            || room.controller.owner != undefined
            || !room.myReserve
            || room.isUnderAttack
            || room.sources[1].container == null
            || room.countBaseNameCreeps('BB') > 0) return false;
        return true;
    },
    body: (room) =>{
        return BodyGenerator.OutsideEnergyHarvester(room);
    }
}

/** 外矿搬运者 */
const role_TO: SpawnConfig = {
    type: SPAWN_TYPE_OUTSIDE,
    baseName: 'TO',
    advance: true,
    memory: (spawn_room, work_room_name) => {
        return {
            room: work_room_name,
            role: '运输',
            mode: MODE_OUTSIDE
        }
    },
    amount: function(spawn_room, work_room_name) {
        if (work_room_name && Memory.rooms[work_room_name]){
            let amount = Memory.rooms[work_room_name].spawnConfig.amount[this.baseName];
            if (amount != null) return amount;
        }
        return 1;
    },
    isLive: (spawn_room, creep) => {
        return true;
    },
    needSpawn: (spawn_room, work_room_name) => {
        // 目标房间没有视野时不生成，先生成斥候
        if (!work_room_name) return false;
        const room = Game.rooms[work_room_name];
        // 以下情况不刷新
        // 1.目标房间没有控制器
        // 2.已被其他人占领
        // 3.房间不是我预定的
        // 4.处于攻击状态
        // 5.房间里没有采集者
        // 6.房间里还有修建者
        if (!room
            || !room.controller
            || room.controller.owner != undefined
            || !room.myReserve
            || room.isUnderAttack
            || room.countBaseNameCreeps('GA', 'GB', 'GC') == 0
            || room.countBaseNameCreeps('BB') > 0) return false;

        return true;
    },
    body: BodyGenerator.OutsideTransporter
}

// 高优先级
export const SPAWN_OUTSIDE_PRIORITY_HIGH: Map<string, SpawnConfig> = new Map([
    // 外矿防御者
    ['DE', role_DE],
]);

// 低优先级
export const SPAWN_OUTSIDE_PRIORITY_LOW: Map<string, SpawnConfig> = new Map([
    // 侦察兵
    ['SC', role_SC],
    // 预定控制器
    ['ENG', role_ENG],
    // 建设者
    ['BB', role_BB],
    // ROOM内能量采集者，A和B对应2个采集点
    ['GA', role_GA],
    ['GB', role_GB],
    // 优先搬运升级能量的搬运者
    ['TO', role_TO],
]);
