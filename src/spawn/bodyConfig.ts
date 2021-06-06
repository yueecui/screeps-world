export const getMaxCarrierBody = function(){
    const group_number = Math.floor(Game.spawns['Spawn1'].room.energyCapacityAvailable / 150) ;
    const body: BodyPartConstant[] = []
    for (let i=0;i<group_number;i++){
        body.push(CARRY, CARRY);
    }
    for (let i=0;i<group_number;i++){
        body.push(MOVE);
    }
    return body
}

export const getMaxCarrier2Body = function(){
    const group_number = Math.floor(Game.spawns['Shanghai'].room.energyCapacityAvailable / 150) ;
    const body: BodyPartConstant[] = []
    for (let i=0;i<group_number;i++){
        body.push(CARRY, CARRY);
    }
    for (let i=0;i<group_number;i++){
        body.push(MOVE);
    }
    return body
}

export const getMaxBuilderBody = function(){
    const group_number = Math.floor(Game.spawns['Spawn1'].room.energyCapacityAvailable / 200) ;
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

export const getMaxBuilder2Body = function(){
    const group_number = Math.floor(Game.spawns['Shanghai'].room.energyCapacityAvailable / 200) ;
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

export const getMinerBody = function(){
    // 4 WORK + 1 MOVE
    const group_number = Math.floor(Game.spawns['Spawn1'].room.energyCapacityAvailable / 450) ;
    const body: BodyPartConstant[] = []
    for (let i=0;i<group_number;i++){
        body.push(WORK, WORK, WORK, WORK);
    }
    for (let i=0;i<group_number;i++){
        body.push(MOVE);
    }
    return body
}


export const BODY_CONFIG: Record<string, BodyPartConstant[]> = {
    'WORKER_BASE': [WORK, CARRY, MOVE],    // 300，道路上1tick，平原上2tick
    'WORKER_HELP': [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE], // 救灾机器人

    '基本挖矿': [WORK, WORK, MOVE, MOVE],    // 300，道路上1tick，平原上2tick

    // RCL 2可用
    'WORKER_R2': [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE],    // WORK*4 + CARRY*2 + MOVE*1 = 550 用于挖资源
    'CARRYER_R2': [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], // CARRY*6 + MOVE*3 = 450，储量300    用于搬运资源
    'BUILDER_R2': [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], // WORK*2 + CARRY*4 + MOVE*3 = 550，道路上1tick，平原上2tick    用于建造建筑物

    '采集者R2': [WORK, WORK, WORK, WORK, WORK, MOVE],    // WORK*5 + MOVE*1 = 550 用于挖资源
    '运输者R2': [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], // CARRY*7 + MOVE*4 = 550，储量300    用于搬运资源
    '建造者R2': [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE], // WORK*2 + CARRY*4 + MOVE*3 = 550，道路上1tick，平原上2tick    用于建造建筑物

    // RCL 3可用
    'WORKER_R3': [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE],    // WORK*6 + CARRY*2 + MOVE*2 = 800 用于挖资源
    'CARRYER_R3': ["carry","carry","carry","carry","carry","carry","carry","carry","carry","carry",
                    "move","move","move","move","move"], // CARRY*10 + MOVE*5 = 750 储量500 用于搬运资源
    'WORKER_R3B': [WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE],    // WORK*7 + CARRY*1 + MOVE*1 = 800 原地挖资源    7个WORK已经可以挖完3000的矿点
    'BUILDER_R3': [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], // WORK*4 + CARRY*4 + MOVE*4 = 800

    // RCL 4可用
    '采集者R4': [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
                            WORK, CARRY, MOVE, MOVE, MOVE],    // WORK*11 + CARRY*1 + MOVE*3 = 1300
    '采集者R4+': [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
                CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE],    // WORK*10 + CARRY*1 + MOVE*6 = 1450
    '升级者R4': [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
                            CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],    // WORK*10 + CARRY*2 + MOVE*4 = 1300
    '侵略者R5': [ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,
                            MOVE, MOVE, MOVE, MOVE, MOVE],

    // RCL 5可用
    '搬运者R5': [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                            CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
}
