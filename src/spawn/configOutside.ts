/**
 * 一个房间内运作必备的虫子的配置
 */

import { MODE_BUILDER, MODE_CONTROLLER, MODE_HARVEST_ENERGY, MODE_HARVEST_MINERAL, MODE_HELP, MODE_REPAIRER, MODE_SPAWN } from "@/constant";

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
    baseName: 'HELP',
    advance: true,
    memory: {
        role: '运输',
        mode: MODE_HELP
    },
    amount: function(room: Room) {
        return 1;
    },
    isLive: (room: Room, creep: Creep) => {
        return true;
    },
    needSpawn: (room: Room) => {
        return room.find(FIND_MY_CREEPS).length == 0 && room.energyAvailable >= 300;
    },
    body: generateBodyTransporter
}


/** 优先搬运孵化能量的搬运者 */
const role_TS: SpawnConfig = {
    baseName: 'TS',
    advance: true,
    memory: {
        role: '运输',
        mode: MODE_SPAWN
    },
    amount: function(room: Room) {
        let amount = room.getSpawnAmount(this.baseName);
        if (amount > 0) return amount;
        return 1;
    },
    isLive: (room: Room, creep: Creep) => {
        return true;
    },
    needSpawn: (room: Room) => {
        // 随时需要
        return true;
    },
    body: generateBodyTransporter
}

/** 优先搬运升级能量的搬运者 */
const role_TU: SpawnConfig = {
    baseName: 'TU',
    advance: true,
    memory: {
        role: '运输',
        mode: MODE_CONTROLLER
    },
    amount: function(room: Room) {
        let amount = room.getSpawnAmount(this.baseName);
        if (amount > 0) return amount;
        return 1;
    },
    isLive: (room: Room, creep: Creep) => {
        return true;
    },
    needSpawn: (room: Room) => {
        // 随时需要
        return true;
    },
    body: generateBodyTransporter
}

/** ROOM内能量采集者，A和B对应2个采集点 */
const role_GA: SpawnConfig = {
    baseName: 'GA',
    advance: true,
    memory: {
        role: '采集',
        mode: MODE_HARVEST_ENERGY,
        node: 0
    },
    amount: function(room: Room) {
        return 1;
    },
    isLive: (room: Room, creep: Creep) => {
        return true;
    },
    needSpawn: (room: Room) => {
        // 随时需要
        return true;
    },
    body: (room: Room) =>{
        return generateBodyEnergyHarvester(room, 0);
    }
}

const role_GB: SpawnConfig = {
    baseName: 'GB',
    advance: true,
    memory: {
        role: '采集',
        mode: MODE_HARVEST_ENERGY,
        node: 1
    },
    amount: function(room: Room) {
        return 1;
    },
    isLive: (room: Room, creep: Creep) => {
        return true;
    },
    needSpawn: (room: Room) => {
        // 随时需要
        return true;
    },
    body: (room: Room) =>{
        return generateBodyEnergyHarvester(room, 1);
    }
}

/** ROOM内矿物采集者 */
const role_GM: SpawnConfig = {
    baseName: 'GM',
    advance: false,
    memory: {
        role: '采集',
        mode: MODE_HARVEST_MINERAL
    },
    amount: function(room: Room) {
        return 1;
    },
    isLive: (room: Room, creep: Creep) => {
        return true;
    },
    needSpawn: (room: Room) => {
        // 房间里的矿物有container并且有矿物时
        // 没有建extracter时，container不会计数
        return room.mineral.container != null && Game.getObjectById((room.mineral.id))!.mineralAmount > 0;
    },
    body: generateBodyMineralHarvester
}

/** 中心操作者 */
const role_MM: SpawnConfig = {
    baseName: 'MM',
    advance: true,
    memory: {
        role: '主脑',
    },
    amount: function(room: Room) {
        return 1;
    },
    isLive: (room: Room, creep: Creep) => {
        return true;
    },
    needSpawn: (room: Room) => {
        // 临时
        return room.name == 'W35N57';
    },
    body: generateBodyMastermind
}

/** 优先建造的建筑者 */
const role_BB: SpawnConfig = {
    baseName: 'BB',
    advance: false,
    memory: {
        role: '建造',
        mode: MODE_BUILDER
    },
    amount: function(room: Room) {
        let amount = room.getSpawnAmount(this.baseName);
        if (amount > 0) return amount;
        return 1;
    },
    isLive: (room: Room, creep: Creep) => {
        return true;
    },
    needSpawn: (room: Room) => {
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
    baseName: 'BR',
    advance: false,
    memory: {
        role: '建造',
        mode: MODE_REPAIRER
    },
    amount: function(room: Room) {
        let amount = room.getSpawnAmount(this.baseName);
        if (amount > 0) return amount;
        return 1;
    },
    isLive: (room: Room, creep: Creep) => {
        return true;
    },
    needSpawn: (room: Room) => {
        // 目前全勤即可
        // 后面应该改成不需要修时不刷新
        return true;
    },
    body: generateBodyBuilder
}

/** 升级者 */
const role_UP: SpawnConfig = {
    baseName: 'UP',
    advance: false,
    memory: {
        role: '升级',
    },
    amount: function(room: Room) {
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
    isLive: (room: Room, creep: Creep) => {
        return true;
    },
    needSpawn: (room: Room) => {
        // 8级时只定期去补时间
        if (room.controller!.level == 8 && room.controller!.ticksToDowngrade > 100000){
            return false;
        }
        return true;
    },
    body: generateBodyUpgrader
}

// 高优先级
export const SPAWN_CONFIG_PRIORITY_HIGH: Map<string, SpawnConfig> = new Map([
    // 全灭后的救灾蚂蚁
    ['HELP', role_HELP],

    // 优先搬运孵化能量的搬运者
    ['TS', role_TS],
    // ROOM内能量采集者，A和B对应2个采集点
    ['GA', role_GA],

    // // 外矿防御者
    // ['DE', role_DE],
]);

// 中优先级
export const SPAWN_CONFIG_PRIORITY_MID: Map<string, SpawnConfig> = new Map([
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
export const SPAWN_CONFIG_PRIORITY_LOW: Map<string, SpawnConfig> = new Map([
    // 优先建造的建筑者
    ['BB', role_BB],
    // 优先修理的建筑者
    ['BR', role_BR],
    // 升级者
    ['UP', role_UP],
]);
