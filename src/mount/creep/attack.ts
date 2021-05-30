import {
    ENERGY_NEED, ENERGY_ENOUGH,
    WORK_IDLE,
    CONTAINER_TYPE_CONTROLLER,
    WORK_HARVEST,
    WORK_GOTO,
} from '@/constant';

export const creepExtensionAttacker = function () {
    // ------------------------------------------------------
    // 寻找目标
    // ------------------------------------------------------

    // 检查是否需要设置工作状态为搬运孵化能量
    // Creep.prototype.findAttackTarget = function(){
    //     if (this.getWorkState() != WORK_TRANSPORTER_SPAWN
    //         && this.room.hasUnqueueTaskSpawn()){
    //         // 设定工作状态
    //         this.clearQueue();
    //         this.clearTarget();
    //         this.setWorkState(WORK_TRANSPORTER_SPAWN);
    //         this.acceptTaskSpawn();
    //         return true;
    //     }
    //     return false;
    // }
}
