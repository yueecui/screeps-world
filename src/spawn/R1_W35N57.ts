import {getMaxCarrierBody, getMaxBuilderBody, getMinerBody, BODY_CONFIG} from './bodyConfig'


const getNewEngBody = function(){
    const body: BodyPartConstant[] = []
    for (let i=0;i<2;i++){
        body.push(MOVE);
    }
    body.push(CLAIM);

    return body
}

const getOutCarrierBody = function(){
    const group_number = 8;
    const body: BodyPartConstant[] = []
    for (let i=0;i<group_number;i++){
        body.push(CARRY, CARRY);
    }
    for (let i=0;i<group_number+2;i++){
        body.push(MOVE);
    }

    return body
}

const getNewBuilderBody = function(){
    // 2300
    // 10 WORK = 1000
    // 9 CARRY = 450
    // 17 MOVE = 850

    const body: BodyPartConstant[] = []
    for (let i=0;i<10;i++){
        body.push(WORK);
    }
    for (let i=0;i<9;i++){
        body.push(CARRY);
    }
    for (let i=0;i<17;i++){
        body.push(MOVE);
    }
    return body
}


// key值：型号名称，生成的creep会用型号+序号的形式自动取名
// body body组成数组
// amount 至少维持的数量
// aheadTime 如果有生命时间少于aheadTime的，提前<aheadTime>值tick，生成下一个，以免断档
// : Map<string, RoleConfig>
export const ACTIVE_ROLE_CONFIG: Map<string, RoleConfig> = new Map([
    // ['Guu', { body: BODY_CONFIG['侵略者R5'], amount: 1, memory: {r:'攻击'} }],
    // ROOM搬运者
    ['TR-S', { body: getMaxCarrierBody(), amount: 1, aheadTime: 160, memory: {r:'运输', mode: 0, stay: [34, 35]} }],
    ['TR-U', { body: getMaxCarrierBody(), amount: 1, aheadTime: 160, memory: {r:'运输', mode: 1, stay: [28, 18]} }],
    // ROOM收集者
    ['GA-B', { body: BODY_CONFIG['采集者R4'], amount: 1, aheadTime: 80, memory: {r:'采集', mode:0, node:1} }],
    ['GA-A', { body: BODY_CONFIG['采集者R4'], amount: 1, aheadTime: 80, memory: {r:'采集', mode:0, node:0} }],

    // ['GA1-M', { body: getMinerBody(), amount: 1, aheadTime: 80, memory: {r:'采集', mode:1} }],
    // 中心操作设备
    ['R1-MM', { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE], amount: 1, aheadTime: 80, memory: {r:'主脑'} }],

    // ROOM外建造者
    ['ENG', { body: [CLAIM, CLAIM, MOVE, MOVE], amount: 1, aheadTime: 80, memory: {r:'工兵', mode:1, flag: 'eng1'}}],
    ['GAO-A', { body: BODY_CONFIG['采集者R4+'], amount: 1, aheadTime: 100,  memory: {r:'采集', room:'W34N57', node:0 }}],
    ['GAO-B', { body: BODY_CONFIG['采集者R4+'], amount: 1, aheadTime: 100,  memory: {r:'采集', room:'W34N57', node:1 }}],
    ['TRO-E', { body: getOutCarrierBody(), amount: 1, aheadTime: 80, memory: {r:'运输', room:'W34N57', mode:2 }}],
    // ['BDO-R', { body: getMaxBuilderBody(), amount: 1, memory: {r:'建造', mode:1, flag: 'colony', stay: [22, 30]} }],    // 修理优先

    // ['R1-BD-B', { body: getMaxBuilderBody(), amount: 1, memory: {r:'建造', mode:0, stay: [29, 27]} }],    // 建造优先
    ['R1-BD-R', { body: getMaxBuilderBody(), amount: 1, memory: {r:'建造', mode:1, stay: [27, 30]} }],    // 修理优先
    // ROOM的建造者
    // ['BD-B', { body: getMaxBuilderBody(), amount: 1, memory: {r:'建造', mode:0, stay: [29, 27]} }],    // 建造优先
    // ['BD-R', { body: getMaxBuilderBody(), amount: 1, memory: {r:'建造', mode:1, stay: [27, 30]} }],    // 修理优先
    // ROOM升级者
    ['UP-A', { body: BODY_CONFIG['升级者R4'], amount: 2, memory: {r:'升级'} }],

    // 开分矿用c
    // ['N-ENG', { body: getNewEngBody(), amount: 1, memory: {r:'手动', mode:1}}],
    // ['N-BD', { body: getNewBuilderBody(), aheadTime: 500, amount: 2, memory: {r:'手动', mode:0}}],

]);
