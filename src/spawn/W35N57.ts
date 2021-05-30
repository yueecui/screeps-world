import {getMaxCarrierBody, getMaxBuilderBody, getMinerBody, BODY_CONFIG} from './bodyConfig'


const getNewEndBody = function(){
    // 2300
    // WORK * 7 = 800
    // CARRY * 7 = 400
    // MOVE * 7 = 400
    // CLAIM = 600
    // HEAL = 250
    // 2300-250-600-50=1400
    [CLAIM, MOVE, HEAL]

    const group_number = 7;
    const body: BodyPartConstant[] = [CLAIM]
    for (let i=0;i<group_number;i++){
        body.push(WORK);
    }
    for (let i=0;i<group_number;i++){
        body.push(CARRY);
    }
    body.push(CLAIM);
    for (let i=0;i<group_number+2;i++){
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
    ['TR-S', { body: getMaxCarrierBody(), amount: 1, aheadTime: 160, memory: {r:'运输', mode: 0, stay: [34, 35]} }],     // W35N57 将各个节点额外的能量搬运到Storage
    ['TR-U', { body: getMaxCarrierBody(), amount: 1, aheadTime: 160, memory: {r:'运输', mode: 1, stay: [28, 18]} }],
    // ROOM收集者
    ['GA-B', { body: BODY_CONFIG['采集者R4'], amount: 1, aheadTime: 80, memory: {r:'采集', mode:0, node:1} }],    // W35N57 下方矿点采集
    ['GA-A', { body: BODY_CONFIG['采集者R4'], amount: 1, aheadTime: 80, memory: {r:'采集', mode:0, node:0} }],    // W35N57 下方矿点采集
    ['GA1-M', { body: getMinerBody(), amount: 1, aheadTime: 80, memory: {r:'采集', mode:1} }],    // W35N57 下方矿点采集
    // ROOM的建造者
    // ['BD-B', { body: getMaxBuilderBody(), amount: 1, memory: {r:'建造', mode:0, stay: [29, 27]} }],    // 建造优先
    ['BD-R', { body: getMaxBuilderBody(), amount: 1, memory: {r:'建造', mode:1, stay: [27, 30]} }],    // 修理优先
    // ROOM升级者
    ['UP-A', { body: BODY_CONFIG['升级者R4'], amount: 3, memory: {r:'升级'} }],

    // 开分矿用
    // ['N-ENG', { body: getMaxBuilder2Body(), amount: 1, memory: {r:'手动', mode:1, flag: 'go1'}}],
    // ['N-BD', { body: getMaxBuilderBody(), amount: 2, memory: {r:'手动', mode:0, flag:'go0'}}],

    // ROOM外建造者
    ['ENG', { body: [CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE], amount: 1, memory: {r:'工兵', mode:1, flag: 'eng1'}}],
    ['BDO-R', { body: BODY_CONFIG['BUILDER_R2'], amount: 1, memory: {r:'建造', mode:1, flag: 'colony', stay: [22, 30]} }],    // 修理优先
]);
