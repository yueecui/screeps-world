const WORK_OBTAIN_ENERGY = 0;
const WORK_DOING = 1;

export const roleUpgrader: Upgrader = {
    run: function(creep) {
        creep.recycleNearby(); // 回收周围的能量
        this.updateWorkStatus(creep);
        this.execute(creep);
	},
    // 根据能量状态切换工作模式
    updateWorkStatus: function(creep){
        if (creep.memory.w == WORK_OBTAIN_ENERGY && creep.store.getFreeCapacity() == 0){
            creep.memory.w = WORK_DOING;
        }else if (creep.memory.w == WORK_DOING && creep.store[RESOURCE_ENERGY] == 0){
            creep.memory.w = WORK_OBTAIN_ENERGY;
        }
    },
    execute: function(creep){
        // this.obtainEnergy(creep);
        // if (creep.pos.x != 28 || creep.pos.y != 18+creep.getIndex()){
        //     creep.moveTo(28, 18+creep.getIndex());
        // }
        // creep.upgradeController(creep.room.controller);

        if (creep.memory.w == WORK_OBTAIN_ENERGY){
            var container = Game.getObjectById('60aa34c759123005a22b9120' as Id<StructureContainer>);
            if (creep.withdraw(container!, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                creep.moveTo(container!)
            }
        }else if (creep.memory.w == WORK_DOING){
            if (creep.pos.x != 28 || creep.pos.y != 20+creep.getIndex()){
                creep.moveTo(28, 20+creep.getIndex())
            }
            creep.upgradeController(creep.room.controller!);
        }
    },
};
