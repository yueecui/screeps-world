/**
 * 一个房间内运作必备的虫子的配置
 */

import { MODE_BUILDER, MODE_CONTROLLER, MODE_HARVEST_ENERGY, MODE_HARVEST_MINERAL, MODE_REPAIRER, MODE_SPAWN } from "@/constant";

import { generateBodyTransporter,
     generateBodyEnergyHarvester,
     generateBodyMineralHarvester,
     generateBodyMastermind,
     generateBodyBuilder,
     generateBodyUpgrader,
     } from './bodyGenerator'

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
        return true;
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
        return true;
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
        return true;
    },
    body: generateBodyBuilder
}

/** 优先修理的建筑者 */
const role_UP: SpawnConfig = {
    baseName: 'UP',
    advance: false,
    memory: {
        role: '升级',
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
        // 8级时需要个处理
        return true;
    },
    body: generateBodyUpgrader
}

export const SPAWN_CONFIG_BASE: Map<string, SpawnConfig> = new Map([
    // 优先搬运孵化能量的搬运者
    ['TS', role_TS],
    // ROOM内能量采集者，A和B对应2个采集点
    ['GA', role_GA],
    // // 外矿防御者
    // ['DE', role_DE],
    // ROOM内能量采集者，A和B对应2个采集点
    ['GB', role_GB],
    // 优先搬运升级能量的搬运者
    ['TU', role_TU],
    // ROOM内矿物采集者
    ['GM', role_GM],
    // 中心操作者
    ['MM', role_MM],
    // 优先建造的建筑者
    ['BB', role_BB],
    // 优先修理的建筑者
    ['BR', role_BR],
    // 升级者
    ['UP', role_UP],
]);

