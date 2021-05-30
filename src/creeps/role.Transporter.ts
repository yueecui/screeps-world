import {
    ENERGY_NEED, ENERGY_ENOUGH,
    WORK_IDLE, WORK_TRANSPORTER_SPAWN, WORK_TRANSPORTER_TOWER, WORK_TRANSPORTER_STORAGE, WORK_TRANSPORTER_CONTROLLER
} from '@/constant';

const IDLE_POS = { x: 28, y: 27 }

export const roleTransporter: Transporter = {
    run: function(creep: Creep) {
        // creep.updateEnergyStatus();
        this.updateStatus(creep);
        this.execute(creep);
    },

    // 判断工作模式
    updateStatus: function(creep){
        // 优先级最高任务
        // 判断是否需要补充孵化能量
        // 会中断其他工作优先进行本工作
        if (creep.checkWorkTransporterSpawn()) return;

        // 空闲下才会执行的任务
        if (creep.getWorkState() == WORK_IDLE){
            if (creep.checkWorkTransporterTower()) return;
            if (creep.checkWorkTransporterController()) return;
            if (creep.checkWorkTransporterStorage()) return;
        }
    },

    // 根据工作模式执行
    execute: function(creep){
        creep.recycleNearby(); // 回收周围的能量

        switch(creep.getWorkState()){
            case WORK_TRANSPORTER_SPAWN:
                creep.doWorkTransporterSpawn();
                break;
            case WORK_TRANSPORTER_TOWER:
                creep.doWorkTransporterTower();
                break;
            case WORK_TRANSPORTER_CONTROLLER:
                creep.doWorkTransporterController();
                break;
            case WORK_TRANSPORTER_STORAGE:
                creep.doWorkTransporterStorage();
                break;
            case WORK_IDLE:
                if (creep.store[RESOURCE_ENERGY] > 0){
                    creep.setEnergyState(ENERGY_ENOUGH);
                    creep.setWorkState(WORK_TRANSPORTER_STORAGE);
                }else if (creep.pos.x != IDLE_POS.x || creep.pos.y != IDLE_POS.y ){
                    creep.moveTo(IDLE_POS.x, IDLE_POS.y);
                }
                break;
            default:
                creep.setWorkState(WORK_IDLE);
        }
    },
};


module.exports = roleTransporter;
