/**
 * 房间外矿虫子配置
 */

import { SPAWN_TYPE_OUTSIDE, MODE_BUILDER, MODE_CONTROLLER, MODE_HARVEST_ENERGY, MODE_HARVEST_MINERAL, MODE_HELP, MODE_REPAIRER, MODE_SPAWN, BOOLEAN_TRUE, BOOLEAN_FALSE, MODE_OUTSIDE } from "@/constant";

import { generateBodyOutsideDefender,
    generateBodyOutsideReserver,
    generateBodyEnergyHarvester,
    generateBodyOutsideTransporter,
    } from './bodyGenerator'

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
            return Memory.rooms[work_room_name].status.underAttack == BOOLEAN_TRUE
                || Memory.rooms[work_room_name].status.hasInvaderCore == BOOLEAN_TRUE;
        }
        return false;
    },
    body: generateBodyOutsideDefender
}

/** 外矿预定者 */
const role_ENG: SpawnConfig = {
    type: SPAWN_TYPE_OUTSIDE,
    baseName: 'ENG',
    advance: true,
    memory: (spawn_room, work_room_name) => {
        return {
            room: work_room_name,
            role: '工兵',
            flag: 'eng1'
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
        // 目标房间没有敌人就可以
        // 由于不一定有视野，所以通过Memory判断
        if (work_room_name && Memory.rooms[work_room_name]){
            return Memory.rooms[work_room_name].status.underAttack == BOOLEAN_FALSE;
        }
        return false;
    },
    body: generateBodyOutsideReserver
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
        // 目标房间没有敌人就可以
        // 由于不一定有视野，所以通过Memory判断
        if (work_room_name && Memory.rooms[work_room_name]){
            return Memory.rooms[work_room_name].status.underAttack == BOOLEAN_FALSE;
        }
        return false;
    },
    body: (room) =>{
        return generateBodyEnergyHarvester(room, true);
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
        // 目标房间没有敌人就可以
        // 由于不一定有视野，所以通过Memory判断
        if (work_room_name && Memory.rooms[work_room_name]){
            return Memory.rooms[work_room_name].status.underAttack == BOOLEAN_FALSE;
        }
        return false;
    },
    body: (room) =>{
        return generateBodyEnergyHarvester(room, true);
    }
}

/** 优先搬运孵化能量的搬运者 */
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
    needSpawn: (spawn_room) => {
        // 随时需要
        return true;
    },
    body: generateBodyOutsideTransporter
}

// 高优先级
export const SPAWN_OUTSIDE_PRIORITY_HIGH: Map<string, SpawnConfig> = new Map([
    // 外矿防御者
    ['DE', role_DE],
]);

// 低优先级
export const SPAWN_OUTSIDE_PRIORITY_LOW: Map<string, SpawnConfig> = new Map([
    // 预定控制器
    ['ENG', role_ENG],
    // ROOM内能量采集者，A和B对应2个采集点
    ['GA', role_GA],
    ['GB', role_GB],
    // 优先搬运升级能量的搬运者
    ['TO', role_TO],
]);
