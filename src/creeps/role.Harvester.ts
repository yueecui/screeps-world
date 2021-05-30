import { WORK_IDLE, WORK_GOTO, WORK_HARVEST, WORK_REPAIR } from "@/constant";

export const roleHarvester: Harvester = {
    run: function(creep) {
        this.updateStatus(creep);
        this.execute(creep);
    },

    // 判断工作模式
    updateStatus: function(creep){
        switch(creep.getWorkState()){
            case WORK_GOTO:
                // 状态切换在执行时
                break;
            case WORK_HARVEST:
                // 状态切换在执行时
                break;
            case WORK_REPAIR:
            case WORK_IDLE:
                creep.checkSourceNodeEnergy();
                break;
        }
    },

    // 根据工作模式执行
    execute: function(creep){
        creep.recycleNearby(); // 回收周围的能量

        switch(creep.getWorkState()){
            case WORK_GOTO:
                creep.goToSourceNode();
                break;
            case WORK_HARVEST:
                creep.doWorkHarvest();
                break;
            case WORK_REPAIR:
                creep.doWorkRepair_Harvester();
                break;
            case WORK_IDLE:
                break;
            default:
                creep.setWorkState(WORK_IDLE);
        }
    }
};
