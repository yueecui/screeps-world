/**
 * 一个房间内运作必备的虫子的配置
 */

import { SPAWN_TYPE_IN_ROOM, MODE_BUILDER, MODE_CONTROLLER, MODE_HARVEST_ENERGY, MODE_HARVEST_MINERAL, MODE_HELP, MODE_REPAIRER, MODE_SPAWN } from "@/constant";

import { generateBodyTransporter,
    generateBodyTransporterHelp,
    generateBodyEnergyHarvester,
    generateBodyMineralHarvester,
    generateBodyMastermind,
    generateBodyBuilder,
    generateBodyUpgrader,
    } from './bodyGenerator'

import { CONSTRUCTION_SITES_PROGRESS_TO_NEED_BUILDER } from '@/config'

/** 全灭后救灾的蚂蚁 */
const role_HELP: SpawnConfig = {
    type: SPAWN_TYPE_IN_ROOM,
    baseName: 'HELP',
    advance: true,
    memory: (spawn_room, work_room_name) => {
        return {
            role: '运输',
            mode: MODE_HELP
        }
    },
    amount: function(room) {
        return 1;
    },
    isLive: (room, creep) => {
        return true;
    },
    needSpawn: (room) => {
        return room.find(FIND_MY_CREEPS).length == 0 && room.energyAvailable >= 300;
    },
    body: generateBodyTransporterHelp
}


/** 优先搬运孵化能量的搬运者 */
const role_TS: SpawnConfig = {
    type: SPAWN_TYPE_IN_ROOM,
    baseName: 'TS',
    advance: true,
    memory: (spawn_room, work_room_name) => {
        return {
            role: '运输',
            mode: MODE_SPAWN
        }
    },
    amount: function(room) {
        let amount = room.getSpawnAmount(this.baseName);
        if (amount > 0) return amount;
        return 1;
    },
    isLive: (room, creep) => {
        return true;
    },
    needSpawn: (room) => {
        // 随时需要
        return true;
    },
    body: generateBodyTransporter
}

/** 优先搬运升级能量的搬运者 */
const role_TU: SpawnConfig = {
    type: SPAWN_TYPE_IN_ROOM,
    baseName: 'TU',
    advance: true,
    memory: (spawn_room, work_room_name) => {
        return {
            role: '运输',
            mode: MODE_CONTROLLER
        }
    },
    amount: function(room) {
        let amount = room.getSpawnAmount(this.baseName);
        if (amount > 0) return amount;
        return 1;
    },
    isLive: (room, creep) => {
        return true;
    },
    needSpawn: (room) => {
        // 随时需要
        return true;
    },
    body: generateBodyTransporter
}

/** ROOM内能量采集者，A和B对应2个采集点 */
const role_GA: SpawnConfig = {
    type: SPAWN_TYPE_IN_ROOM,
    baseName: 'GA',
    advance: true,
    memory: (spawn_room, work_room_name) => {
        return {
            role: '采集',
            mode: MODE_HARVEST_ENERGY,
            node: 0
        }
    },
    amount: function(room) {
        return 1;
    },
    isLive: (room, creep) => {
        return true;
    },
    needSpawn: (room) => {
        // 随时需要
        return true;
    },
    body: (room) =>{
        return generateBodyEnergyHarvester(room, false);
    }
}

const role_GB: SpawnConfig = {
    type: SPAWN_TYPE_IN_ROOM,
    baseName: 'GB',
    advance: true,
    memory: (spawn_room, work_room_name) => {
        return {
            role: '采集',
            mode: MODE_HARVEST_ENERGY,
            node: 1
        }
    },
    amount: function(room) {
        return 1;
    },
    isLive: (room, creep) => {
        return true;
    },
    needSpawn: (room) => {
        // 随时需要
        return true;
    },
    body: (room) =>{
        return generateBodyEnergyHarvester(room, false);
    }
}

/** ROOM内矿物采集者 */
const role_GM: SpawnConfig = {
    type: SPAWN_TYPE_IN_ROOM,
    baseName: 'GM',
    advance: false,
    memory: (spawn_room, work_room_name) => {
        return {
            role: '采集',
            mode: MODE_HARVEST_MINERAL,
        }
    },
    amount: function(room) {
        return 1;
    },
    isLive: (room, creep) => {
        return true;
    },
    needSpawn: (room) => {
        // 房间里的矿物有container并且有矿物时
        // 没有建extracter时，container不会计数
        return room.mineral.container != null && Game.getObjectById((room.mineral.id))!.mineralAmount > 0;
    },
    body: generateBodyMineralHarvester
}

/** 中心操作者 */
const role_MM: SpawnConfig = {
    type: SPAWN_TYPE_IN_ROOM,
    baseName: 'MM',
    advance: true,
    memory: (spawn_room, work_room_name) => {
        return {
            role: '主脑',
            mode: MODE_HARVEST_MINERAL,
        }
    },
    amount: function(room) {
        return 1;
    },
    isLive: (room, creep) => {
        return true;
    },
    needSpawn: (room) => {
        // 临时
        return room.name == 'W35N57';
    },
    body: generateBodyMastermind
}

/** 优先建造的建筑者 */
const role_BB: SpawnConfig = {
    type: SPAWN_TYPE_IN_ROOM,
    baseName: 'BB',
    advance: false,
    memory: (spawn_room, work_room_name) => {
        return {
            role: '建造',
            mode: MODE_BUILDER
        }
    },
    amount: function(room) {
        let amount = room.getSpawnAmount(this.baseName);
        if (amount > 0) return amount;
        return 1;
    },
    isLive: (room, creep) => {
        return true;
    },
    needSpawn: (room) => {
        const found = room.find(FIND_MY_CONSTRUCTION_SITES);
        let total_progress = 0;
        for (const site of found){
            total_progress += site.progress;
            if (total_progress >= CONSTRUCTION_SITES_PROGRESS_TO_NEED_BUILDER){
                return true;
            }
        }
        return false;
    },
    body: generateBodyBuilder
}

/** 优先修理的建筑者 */
const role_BR: SpawnConfig = {
    type: SPAWN_TYPE_IN_ROOM,
    baseName: 'BR',
    advance: false,
    memory: (spawn_room, work_room_name) => {
        return {
            role: '建造',
            mode: MODE_REPAIRER
        }
    },
    amount: function(room) {
        let amount = room.getSpawnAmount(this.baseName);
        if (amount > 0) return amount;
        return 1;
    },
    isLive: (room, creep) => {
        return true;
    },
    needSpawn: (room) => {
        // 目前全勤即可
        // 后面应该改成不需要修时不刷新
        return true;
    },
    body: generateBodyBuilder
}

/** 升级者 */
const role_UP: SpawnConfig = {
    type: SPAWN_TYPE_IN_ROOM,
    baseName: 'UP',
    advance: false,
    memory: (spawn_room, work_room_name) => {
        return {
            role: '升级',
            mode: MODE_REPAIRER
        }
    },
    amount: function(room) {
        let amount = room.getSpawnAmount(this.baseName);
        if (amount > 0) return amount;

        const level = room.controller!.level;
        if (level == 2){
            return 2;
        }else if (level == 3){
            return 5;
        }else if (room.storage){
            const energy = room.storage.store[RESOURCE_ENERGY];
            if (energy > 300000){
                return 3;
            }else if(energy > 150000){
                return 2;
            }
        }
        return 1;
    },
    isLive: (room, creep) => {
        return true;
    },
    needSpawn: (room) => {
        // 8级时只定期去补时间
        if (room.controller!.level == 8 && room.controller!.ticksToDowngrade > 100000){
            return false;
        }
        return true;
    },
    body: generateBodyUpgrader
}

// 高优先级
export const SPAWN_BASE_PRIORITY_HIGH: Map<string, SpawnConfig> = new Map([
    // 全灭后的救灾蚂蚁
    ['HELP', role_HELP],

    // 优先搬运孵化能量的搬运者
    ['TS', role_TS],
    // ROOM内能量采集者，A和B对应2个采集点
    ['GA', role_GA],
]);

// 中优先级
export const SPAWN_BASE_PRIORITY_MID: Map<string, SpawnConfig> = new Map([
    // ROOM内能量采集者，A和B对应2个采集点
    ['GB', role_GB],
    // 优先搬运升级能量的搬运者
    ['TU', role_TU],
    // ROOM内矿物采集者
    ['GM', role_GM],
    // 中心操作者
    ['MM', role_MM],
]);

// 低优先级
export const SPAWN_BASE_PRIORITY_LOW: Map<string, SpawnConfig> = new Map([
    // 优先建造的建筑者
    ['BB', role_BB],
    // 优先修理的建筑者
    ['BR', role_BR],
    // 升级者
    ['UP', role_UP],
]);
