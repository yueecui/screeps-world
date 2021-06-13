// 上限
// 1: 300
// 2: 550
// 3: 800
// 4: 1300
// 5: 1800
// 6: 2300
// 7: 5600
// 8: 12900


export const generateBodyTransporterHelp = function(room: Room){
    // 后续需要调整成可以带WORK的

    // 最少可能只有300
    const group_amount = Math.min(Math.floor(room.energyAvailable / 150), 16) ;
    const body: BodyPartConstant[] = []
    for (let i=0;i<group_amount;i++){
        body.push(CARRY, CARRY);
    }
    for (let i=0;i<group_amount;i++){
        body.push(MOVE);
    }
    return body
}

export const generateBodyTransporter = function(room: Room){
    // 50/3=16.6666666667
    const group_amount = Math.min(Math.floor(room.energyCapacityAvailable / 150), 16) ;
    const body: BodyPartConstant[] = []
    for (let i=0;i<group_amount;i++){
        body.push(CARRY, CARRY);
    }
    for (let i=0;i<group_amount;i++){
        body.push(MOVE);
    }
    return body
}


// 上限
// 1: 300
// 2: 550
// 3: 800
// 4: 1300
// 5: 1800
export const generateBodyEnergyHarvester = function(room: Room, node_index: number){
    const cap = room.energyCapacityAvailable;
    let work_amount = 1;
    let carry_amount = 1;
    let move_amount = 1;

    // link模式
    if (room.sources[node_index].link != null && cap >= 1400){
        work_amount = 10; // 一次挖20，5次挖到100, 100存一次
        carry_amount = 3; // 150容量，超100就存，留50富裕免得掉地上
        move_amount = 5;
    }
    // container模式
    else if (cap >= 1300){
        // 需要4级
        work_amount = 10;
        move_amount = 5;
    }else if (cap >= 800){
        // 需要3级
        work_amount = 6;
        move_amount = 3;
    }else if (cap >= 550){
        // 需要2级
        work_amount = 5;
        carry_amount = 0;
        move_amount = 1;
    }
    // 生成
    const body: BodyPartConstant[] = []
    for (let i=0;i<work_amount;i++){
        body.push(WORK);
    }
    for (let i=0;i<carry_amount;i++){
        body.push(CARRY);
    }
    for (let i=0;i<move_amount;i++){
        body.push(MOVE);
    }
    return body
}

export const generateBodyMineralHarvester = function(room: Room){
    // 50/5=10
    // 4 WORK + 1 MOVE
    const group_amount = Math.min(Math.floor(room.energyCapacityAvailable / 450), 10) ;
    // 生成
    const body: BodyPartConstant[] = []
    for (let i=0;i<group_amount;i++){
        body.push(WORK, WORK, WORK, WORK);
    }
    for (let i=0;i<group_amount;i++){
        body.push(MOVE);
    }
    return body
}


export const generateBodyMastermind = function(room: Room){
    let carry_amount;
    if (room.controller!.level < 8){
        carry_amount = 16;
    }else{
        // 1 MOVE，其他是CARRY
        carry_amount = Math.min(Math.floor((room.energyCapacityAvailable -50) / 50), 16);
    }
    // 生成
    const body: BodyPartConstant[] = []
    for (let i=0;i<carry_amount;i++){
        body.push(CARRY);
    }
    body.push(MOVE);
    return body
}


export const generateBodyBuilder = function(room: Room){
    // 50/3=16.6666666667
    const group_amount = Math.min(Math.floor(room.energyCapacityAvailable / 200), 16);
    const body: BodyPartConstant[] = []
    for (let i=0;i<group_amount;i++){
        body.push(WORK);
    }
    for (let i=0;i<group_amount;i++){
        body.push(CARRY);
    }
    for (let i=0;i<group_amount;i++){
        body.push(MOVE);
    }
    return body
}


export const generateBodyUpgrader = function(room: Room){
    if (room.controller!.level == 8){
        return [WORK, CARRY, MOVE];
    }
    const cap = room.energyCapacityAvailable;
    let work_amount;
    let carry_amount = 2;
    let move_amount;
    if (cap >= 4300){ // 7级
        work_amount = 40;
        carry_amount = 4;
        move_amount = 6;
    }else if (cap >= 2300){ // 6级
        work_amount = 20;
        move_amount = 4;
    }else if (cap >= 1800){ // 5级
        work_amount = 15;
        move_amount = 4;
    }else if (cap >= 1250){ // 4级
        work_amount = 10;
        move_amount = 3;
    }else if (cap >= 800){ // 3级
        work_amount = 6;
        move_amount = 2;
    }else if (cap >= 550){ // 2级
        work_amount = 4;
        carry_amount = 1;
        move_amount = 2;
    }else{  // 1级，一般不会生成1级的
        work_amount = 2;
        carry_amount = 1;
        move_amount = 1;
    }
    // 生成
    const body: BodyPartConstant[] = []
    for (let i=0;i<work_amount;i++){
        body.push(WORK);
    }
    for (let i=0;i<carry_amount;i++){
        body.push(CARRY);
    }
    for (let i=0;i<move_amount;i++){
        body.push(MOVE);
    }
    return body
}

// 上限
// 1: 300
// 2: 550
// 3: 800
// 4: 1300
// 5: 1800
// 6: 2300
// 7: 5600
// 8: 12900

// 4级以上才能有外矿
// 外矿敌人就是一个普通的10parts小兵
export const generateBodyOutsideDefender = function(room: Room){
    // 目前采取简单策略
    // 10 ATTACK + 5 MOVE
    const group_amount = 5;
    const body: BodyPartConstant[] = []
    for (let i=0;i<group_amount;i++){
        body.push(ATTACK, ATTACK);
    }
    for (let i=0;i<group_amount;i++){
        body.push(MOVE);
    }
    return body
}


// 预订者
export const generateBodyOutsideReserver = function(room: Room){
    return [CLAIM, CLAIM, MOVE, MOVE]
}

// 外矿采集者，需要保证到岗时间
// 4级以上才有外矿
// 4: 1300
// 5: 1800
export const generateBodyOutsideEnergyHarvester = function(room: Room){
    const cap = room.energyCapacityAvailable;
    let work_amount = 1;
    let carry_amount = 1;
    let move_amount = 1;
    // 还要判断有LINK的模式
    if (cap >= 1350){ // 需要4级
        work_amount = 10;
        move_amount = 6;
    }else if (cap >= 1200){ // 需要4级
        work_amount = 9;
        move_amount = 5;
    }
    // 生成
    const body: BodyPartConstant[] = []
    for (let i=0;i<work_amount;i++){
        body.push(WORK);
    }
    for (let i=0;i<carry_amount;i++){
        body.push(CARRY);
    }
    for (let i=0;i<move_amount;i++){
        body.push(MOVE);
    }
    return body
}

// 外矿运输者
// 目前先一样，后面会加WORK
export const generateBodyOutsideTransporter = function(room: Room){
    // 50/3=16.6666666667
    const group_amount = Math.min(Math.floor(room.energyCapacityAvailable / 150), 16) ;
    const body: BodyPartConstant[] = []
    for (let i=0;i<group_amount;i++){
        body.push(CARRY, CARRY);
    }
    for (let i=0;i<group_amount;i++){
        body.push(MOVE);
    }
    return body
}
