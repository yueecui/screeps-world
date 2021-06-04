import {getMaxCarrier2Body, getMaxBuilder2Body, getMinerBody, BODY_CONFIG} from './bodyConfig'

export const getMaxCarrier3Body = function(){
    const group_number = Math.floor(Game.spawns['Shanghai'].room.energyCapacityAvailable / 100) ;
    const body: BodyPartConstant[] = []
    for (let i=0;i<group_number;i++){
        body.push(CARRY);
    }
    for (let i=0;i<group_number;i++){
        body.push(MOVE);
    }
    return body
}

// key值：型号名称，生成的creep会用型号+序号的形式自动取名
// body body组成数组
// amount 至少维持的数量
// aheadTime 如果有生命时间少于aheadTime的，提前<aheadTime>值tick，生成下一个，以免断档
// : Map<string, RoleConfig>
export const ROOM_2_CONFIG: Map<string, RoleConfig> = new Map([
    // ['Guu', { body: BODY_CONFIG['侵略者R5'], amount: 1, memory: {r:'攻击'} }],
    // ROOM搬运者
    ['R2-TR-T', { body: getMaxCarrier2Body(), amount: 1, aheadTime: 80, memory: {r:'运输', mode: 0, stay: [6, 29]} }],
    ['R2-TR-U', { body: getMaxCarrier2Body(), amount: 1, aheadTime: 80, memory: {r:'运输', mode: 1, stay: [26, 26]} }],
    // ROOM收集者
    ['R2-GA-A', { body: BODY_CONFIG['采集者R4'], amount: 1, aheadTime: 80, memory: {r:'采集', mode:0, node:0} }],
    ['R2-GA-B', { body: BODY_CONFIG['采集者R4'], amount: 1, aheadTime: 80, memory: {r:'采集', mode:0, node:1} }],
    // ['GA1-M', { body: getMinerBody(), amount: 1, aheadTime: 80, memory: {r:'采集', mode:1} }],
    // 中心操作设备
    // ['R1-MM', { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE], amount: 1, aheadTime: 80, memory: {r:'主脑'} }],

    // ['R2-ST', { body: getMaxCarrier3Body(), amount: 3, aheadTime: 600, memory: {r:'手动', mode: 0, stay: [26, 26]} }],

    // ROOM的建造者
    // ['R2-BD-B', { body: getMaxBuilderBody(), amount: 1, memory: {r:'建造', mode:0, stay: [29, 27]} }],    // 建造优先
    ['R2-BD-R', { body: getMaxBuilder2Body(), amount: 1, memory: {r:'建造', mode:1, stay: [20, 26]} }],    // 修理优先
    // ROOM升级者
    ['R2-UP', { body: BODY_CONFIG['升级者R4'], amount: 1, memory: {r:'升级'} }],

    // 开分矿用c
    // ['N-ENG', { body: getNewEngBody(), amount: 1, memory: {r:'手动', mode:1}}],
    // ['N-BD', { body: getNewBuilderBody(), amount: 1, memory: {r:'手动', mode:0}}],
]);
