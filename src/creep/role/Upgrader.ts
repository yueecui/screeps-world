export default function (creep: Creep) {
    updateStatus(creep);
    execute(creep);
}

// 判断工作模式
const updateStatus = function(creep: Creep){
    switch(creep.work){
        case WORK_UPGRADE:
            break;
        case WORK_IDLE:
            creep.work = WORK_UPGRADE;
            break;
    }
}

// 根据工作模式执行
const execute = function(creep: Creep){
    creep.recycleNearby(); // 回收周围的能量

    switch(creep.work){
        case WORK_UPGRADE:
            creep.upgraderDoWork();
            break;
        case WORK_IDLE:
            break;
        default:
            creep.work = WORK_IDLE;
    }
}
