import { WORK_IDLE, WORK_HARVEST } from "@/constant";

export const roleHarvester: Harvester = {
    run: function(creep) {
        this.updateStatus(creep);
        this.execute(creep);
    },

    // 判断工作模式
    updateStatus: function(creep){
        switch(creep.getWorkState()){
            case WORK_HARVEST:
                break;
            case WORK_IDLE:
                creep.setWorkState(WORK_HARVEST);
                break;
        }
    },

    // 根据工作模式执行
    execute: function(creep){
        creep.recycleNearby(); // 回收周围的能量

        switch(creep.getWorkState()){
            case WORK_HARVEST:
                creep.doWorkHarvest();
                break;
            case WORK_IDLE:
                break;
            default:
                creep.setWorkState(WORK_IDLE);
        }
    }
};
