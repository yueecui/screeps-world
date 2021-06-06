/**
 * 一个房间内运作必备的虫子的配置
 */

// 运输型
const getTransporterConfig = (room: Room, opt: Record<string, any>) => {

}

export const SPAWN_CONFIG_BASE: Map<string, any> = new Map([
    // 优先搬运孵化能量的搬运者
    ['TS', {
        liveCondition: 2,
        respawnCondition: 1,
        initMemory: {},
    }],
    // { amount: 1, aheadTime: 160, memory: {r:'运输', mode: 0, stay: [34, 35]} }],
    // ROOM内能量采集者，A和B对应2个采集点
    ['GA', { amount: 1, aheadTime: 80, memory: {r:'采集', mode:0, node:0} }],
    ['GB', { amount: 1, aheadTime: 80, memory: {r:'采集', mode:0, node:1} }],
    // 优先搬运升级能量的搬运者
    ['TU', { amount: 1, aheadTime: 160, memory: {r:'运输', mode: 1, stay: [28, 18]} }],
    // ROOM内矿物采集者
    ['GM', { amount: 1, aheadTime: 80, memory: {r:'采集', mode:1 } }],
    // 中心操作者
    ['MM', { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE], amount: 1, aheadTime: 80, memory: {r:'主脑'} }],
    // 优先建造的建筑者
    ['BB', { amount: 1, memory: {r:'建造', mode:0, stay: [29, 27]} }],
    // 优先修理的建筑者
    ['BR', { amount: 1, memory: {r:'建造', mode:1, stay: [27, 30]} }],
    // 升级者
    ['UP', { amount: 3, memory: {r:'升级'} }],
]);
