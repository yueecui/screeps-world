// 移动能量储存用

const WORK_OBTAIN_ENERGY = 0;
const WORK_CARRYING = 1;

const ROUTE_CONFIG = [
    {container: '60aa34c759123005a22b9120', capacity_min: 1000, x: 27, y: 20},  // W35N57 上方矿点搬运，供给Upgrader
    {container: '60aa044fea027425aec64b83', capacity_min: 1000, x: 27, y: 23},  // W35N57 下方矿点搬运，供给Upgrader
]

var roleCarryer = {
    run: function(creep) {
        creep.recycleNearby(); // 回收周围的能量
        this.updateWorkStatus(creep);
        this.execute(creep);
    },
    // 根据能量状态切换工作模式
    updateWorkStatus: function(creep){
        if (creep.memory.s == WORK_OBTAIN_ENERGY && creep.store.getFreeCapacity() == 0){
            creep.memory.s = WORK_CARRYING;
        }else if (creep.memory.s == WORK_CARRYING && creep.store[RESOURCE_ENERGY] == 0){
            creep.memory.s = WORK_OBTAIN_ENERGY;
        }
    },
    execute: function(creep){
        const config = ROUTE_CONFIG[creep.memory.route || 0];
        if (creep.memory.s == WORK_OBTAIN_ENERGY){
            if (creep.isRecycling()){
                return;
            }
            const container = Game.getObjectById(config.container);
            if (container.store[RESOURCE_ENERGY] && container.store[RESOURCE_ENERGY] > config.capacity_min){
                if(creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container);
                }
            }else if (creep.pos.getRangeTo(container)>1) {
                creep.moveTo(container);
            }
        }else if (creep.memory.s == WORK_CARRYING){
            creep.moveTo(config.x , config.y);
        }
    },
 
};


module.exports = roleCarryer;