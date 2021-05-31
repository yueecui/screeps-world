import {getMaxCarrierBody, getMaxBuilderBody, getMinerBody, BODY_CONFIG} from './bodyConfig'

// key值：型号名称，生成的creep会用型号+序号的形式自动取名
// body body组成数组
// amount 至少维持的数量
// aheadTime 如果有生命时间少于aheadTime的，提前<aheadTime>值tick，生成下一个，以免断档
// : Map<string, RoleConfig>
export const R2_CREEP_CONFIG: Map<string, RoleConfig> = new Map([
    // ['Guu', { body: BODY_CONFIG['侵略者R5'], amount: 1, memory: {r:'攻击'} }],
    // ROOM搬运者
    ['R2-TR-T', { body: BODY_CONFIG['运输者R2'], amount: 1, aheadTime: 80, memory: {r:'运输', mode: 0, stay: [6, 29]} }],
    ['R2-TR-U', { body: BODY_CONFIG['运输者R2'], amount: 3, aheadTime: 80, memory: {r:'运输', mode: 1, stay: [26, 24]} }],
    // ROOM收集者
    ['R2-GA-A', { body: BODY_CONFIG['采集者R2'], amount: 1, aheadTime: 80, memory: {r:'采集', mode:0, node:0} }],
    ['R2-GA-B', { body: BODY_CONFIG['采集者R2'], amount: 1, aheadTime: 80, memory: {r:'采集', mode:0, node:1} }],
    // ['GA1-M', { body: getMinerBody(), amount: 1, aheadTime: 80, memory: {r:'采集', mode:1} }],
    // 中心操作设备
    // ['R1-MM', { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE], amount: 1, aheadTime: 80, memory: {r:'主脑'} }],

    // ROOM的建造者
    // ['BD-B', { body: getMaxBuilderBody(), amount: 1, memory: {r:'建造', mode:0, stay: [29, 27]} }],    // 建造优先
    ['BD-R', { body: BODY_CONFIG['BUILDER_R2'], amount: 1, memory: {r:'建造', mode:1, stay: [20, 26]} }],    // 修理优先
    // ROOM升级者
    ['R2-UP', { body: BODY_CONFIG['WORKER_R2'], amount: 6, memory: {r:'升级'} }],

    // 开分矿用c
    // ['N-ENG', { body: getNewEngBody(), amount: 1, memory: {r:'手动', mode:1}}],
    // ['N-BD', { body: getNewBuilderBody(), amount: 1, memory: {r:'手动', mode:0}}],
]);
