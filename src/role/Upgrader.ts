import { WORK_IDLE, WORK_UPGRADE } from "@/constant";


export const roleUpgrader: Upgrader = {
    run: function(creep) {
        this.updateStatus(creep);
        this.execute(creep);
	},

    // 判断工作模式
    updateStatus: function(creep){
        switch(creep.getWorkState()){
            case WORK_UPGRADE:
                break;
            case WORK_IDLE:
                creep.setWorkState(WORK_UPGRADE);
                break;
        }
    },

    // 根据工作模式执行
    execute: function(creep){
        creep.recycleNearby(); // 回收周围的能量

        switch(creep.getWorkState()){
            case WORK_UPGRADE:
                creep.upgraderDoWork();
                break;
            case WORK_IDLE:
                break;
            default:
                creep.setWorkState(WORK_IDLE);
        }
    },
};
