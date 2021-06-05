/**
 * 一个房间内运作必备的虫子的配置
 */

export const SPAWN_CONFIG: Map<string, RoleConfig> = new Map([
    // 搬运者
    ['TR-S', { amount: 1, aheadTime: 160, memory: {r:'运输', mode: 0, stay: [34, 35]} }],
    ['TR-U', { amount: 1, aheadTime: 160, memory: {r:'运输', mode: 1, stay: [28, 18]} }],
    // 采集者
    ['GA-A', { amount: 1, aheadTime: 80, memory: {r:'采集', mode:0, node:0} }],
    ['GA-B', { amount: 1, aheadTime: 80, memory: {r:'采集', mode:0, node:1} }],
    ['GA-M', { amount: 1, aheadTime: 80, memory: {r:'采集', mode:1 } }],

    // 中心操作者
    ['MM', { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE], amount: 1, aheadTime: 80, memory: {r:'主脑'} }],

    // 建造者
    ['BD-B', { amount: 1, memory: {r:'建造', mode:0, stay: [29, 27]} }],
    ['BD-R', { amount: 1, memory: {r:'建造', mode:1, stay: [27, 30]} }],

    // 升级者
    ['UP', { amount: 3, memory: {r:'升级'} }],
]);
