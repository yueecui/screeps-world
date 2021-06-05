import {getMaxCarrier2Body, getMaxBuilder2Body, BODY_CONFIG} from './bodyConfig'

const getMaxCarrier3Body = function(){
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
    // ['Guu', { body: BODY_CONFIG['侵略者R5'], amount: 1, memory: {r:'攻击'} }],
    // ROOM搬运者

    // ROOM收集者
    ['R3-GA-A', { body: BODY_CONFIG['采集者R2'], amount: 1, aheadTime: 80, memory: {r:'采集', mode:0, node:0} }],
    ['R3-TR-T', { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE,  MOVE], amount: 1, aheadTime: 80, memory: {r:'运输', mode: 0, stay: [33, 33]} }],


    ['R3-GA-B', { body: BODY_CONFIG['采集者R2'], amount: 1, aheadTime: 80, memory: {r:'采集', mode:0, node:1} }],

    ['R3-TR-U', { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE,  MOVE], amount: 2, aheadTime: 80, memory: {r:'运输', mode: 1, stay: [30, 28]} }],

    // ['GA1-M', { body: getMinerBody(), amount: 1, aheadTime: 80, memory: {r:'采集', mode:1} }],
    // 中心操作设备
    // ['R1-MM', { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE], amount: 1, aheadTime: 80, memory: {r:'主脑'} }],

    // ROOM的建造者
    // ['R3-BD-B', { body: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], amount: 1, memory: {r:'建造', mode:0, stay: [35, 32]} }],    // 建造优先
    ['R3-BD-R', { body: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], amount: 1, memory: {r:'建造', mode:1, stay: [35, 32]} }],    // 建造优先
    // ['R2-BD-R', { body: getMaxBuilder2Body(), amount: 1, memory: {r:'建造', mode:1, stay: [20, 26]} }],    // 修理优先
    // ROOM升级者
    ['R3-UP', { body: [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE], amount: 6, memory: {r:'升级'} }],

    // ['R2-ST', { body: getMaxCarrier3Body(), amount: 8, aheadTime: 400, memory: {r:'手动', mode: 0, stay: [26, 26]} }],

    // 开分矿用c
    // ['N-ENG', { body: [CLAIM, MOVE], amount: 1, memory: {r:'手动', mode:1}}],
    // ['N-BD-A', { body: getMaxBuilder2Body(), amount: 1, memory: {r:'手动', mode:0, node:0}}],
    // ['N-BD-B', { body: getMaxBuilder2Body(), amount: 1, memory: {r:'手动', mode:0, node:1}}],
]);
