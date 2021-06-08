import {getMaxCarrier2Body, getMaxBuilder2Body, BODY_CONFIG} from './bodyConfig'

const getMaxBuilder3Body = function(){
    const group_number = Math.floor(Game.spawns['Beijing'].room.energyCapacityAvailable / 200) ;
    const body: BodyPartConstant[] = []
    for (let i=0;i<group_number;i++){
        body.push(WORK);
    }
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
export const ROOM_3_CONFIG: Map<string, RoleConfig> = new Map([
    // ['R3-Guu', { body: BODY_CONFIG['侵略者R5'], amount: 1, memory: {role:'攻击'} }],
    // ROOM搬运者

    // ROOM收集者
    ['R3-GA', { body: BODY_CONFIG['WORKER_R3B'], amount: 1, aheadTime: 80, memory: {role:'采集', mode:0, node:0} }],
    ['R3-TS', { body: BODY_CONFIG['CARRYER_R3'], amount: 1, aheadTime: 80, memory: {role:'运输', mode: 0, stay: [33, 33]} }],


    ['R3-GB', { body: BODY_CONFIG['WORKER_R3B'], amount: 1, aheadTime: 80, memory: {role:'采集', mode:0, node:1} }],

    ['R3-TU', { body: BODY_CONFIG['CARRYER_R3'], amount: 1, aheadTime: 80, memory: {role:'运输', mode: 1, stay: [30, 28]} }],

    // ['GA1-M', { body: getMinerBody(), amount: 1, aheadTime: 80, memory: {role:'采集', mode:1} }],
    // 中心操作设备
    // ['R1-MM', { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE], amount: 1, aheadTime: 80, memory: {role:'主脑'} }],

    // ROOM的建造者
    // ['R3-BB', { body: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], amount: 1, memory: {role:'建造', mode:0, stay: [35, 32]} }],    // 建造优先
    ['R3-BR', { body: getMaxBuilder3Body(), amount: 1, memory: {role:'建造', mode:1, stay: [35, 32]} }],    // 建造优先
    // ['R2-BD-R', { body: getMaxBuilder2Body(), amount: 1, memory: {role:'建造', mode:1, stay: [20, 26]} }],    // 修理优先
    // ROOM升级者
    ['R3-UP', { body: BODY_CONFIG['WORKER_R3'], amount: 2, memory: {role:'升级'} }],

    // ['R2-ST', { body: getMaxCarrier3Body(), amount: 8, aheadTime: 400, memory: {role:'手动', mode: 0, stay: [26, 26]} }],

    // 开分矿用c
    // ['N-ENG', { body: [CLAIM, MOVE], amount: 1, memory: {role:'手动', mode:1}}],
    // ['N-BD-A', { body: getMaxBuilder2Body(), amount: 1, memory: {role:'手动', mode:0, node:0}}],
    // ['N-BD-B', { body: getMaxBuilder2Body(), amount: 1, memory: {role:'手动', mode:0, node:1}}],
]);
