import {
    ENERGY_NEED, ENERGY_ENOUGH,
    WORK_IDLE, WORK_TRANSPORTER_SPAWN, WORK_TRANSPORTER_TOWER, WORK_TRANSPORTER_STORAGE_ENERGY, WORK_TRANSPORTER_CONTROLLER,
    MODE_SPAWN, MODE_CONTROLLER, WORK_TRANSPORTER_STORAGE_MINERAL
} from '@/constant';

const IDLE_POS = { x: 28, y: 27 }

export const roleTransporter: Transporter = {
    run: function(creep: Creep) {
        this.updateStatus(creep);
        this.execute(creep);
    },

    // 判断工作模式
    updateStatus: function(creep){
        // 优先级最高任务
        // 判断是否需要补充孵化能量
        // 会中断其他工作优先进行本工作
        if (creep.getMode() == MODE_CONTROLLER){
            if (creep.checkWorkTransporterStorage_Mineral()) return;
            if (creep.checkWorkTransporterController()) return;

            // 空闲下才会执行的任务
            if (creep.getWorkState() == WORK_IDLE){
                if (creep.checkWorkTransporterSpawn()) return;
                if (creep.checkWorkTransporterTower()) return;
                // if (creep.checkWorkTransporterStorage_Mineral()) return;
                if (creep.checkWorkTransporterStorage_Energy()) return;
            }
        }else {
            if (creep.checkWorkTransporterSpawn()) return;

            // 空闲下才会执行的任务
            if (creep.getWorkState() == WORK_IDLE){
                if (creep.checkWorkTransporterTower()) return;
                if (creep.checkWorkTransporterController()) return;
                // if (creep.checkWorkTransporterStorage_Mineral()) return;
                if (creep.checkWorkTransporterStorage_Energy()) return;
            }
        }

    },

    // 根据工作模式执行
    execute: function(creep){
        if (creep.getWorkState() != WORK_TRANSPORTER_STORAGE_MINERAL){
            creep.recycleNearby(); // 回收周围的能量
        }

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
            case WORK_TRANSPORTER_STORAGE_ENERGY:
                creep.doWorkTransporterStorage_Energy();
                break;
            case WORK_TRANSPORTER_STORAGE_MINERAL:
                creep.doWorkTransporterStorage_Mineral();
                break;
            case WORK_IDLE:
                if (creep.store[RESOURCE_ENERGY] > 0){
                    creep.setEnergyState(ENERGY_ENOUGH);
                    creep.setWorkState(WORK_TRANSPORTER_STORAGE_ENERGY);
                }else{
                    creep.goToStay();
                }
                break;
            default:
                creep.setWorkState(WORK_IDLE);
        }
    },
};


module.exports = roleTransporter;
