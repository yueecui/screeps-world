import {
    ENERGY_NEED, ENERGY_ENOUGH,
    WORK_IDLE, WORK_TRANSPORTER_SPAWN, WORK_TRANSPORTER_TOWER, WORK_TRANSPORTER_STORAGE,
    TASK_WAITING, TASK_ACCEPTED,
    CONTAINER_TYPE_SOURCE,
} from '@/constant';

export const creepExtensionTransporter = function () {
    // ------------------------------------------------------
    // 孵化能量搬运
    // ------------------------------------------------------

    // 检查是否需要设置工作状态为搬运孵化能量
    Creep.prototype.checkWorkTransporterSpawn = function(){
        if (this.getWorkState() != WORK_TRANSPORTER_SPAWN
            && this.room.hasUnqueueSpawnEnergyStores()){
                // 设定工作状态
                this.clearQueue();
                this.clearTarget();
                this.acceptTaskSpawn();
                this.setWorkState(WORK_TRANSPORTER_SPAWN);
        }
    }

    // 执行WORK_TRANSPORTER_SPAWN
    Creep.prototype.doWorkTransporterSpawn = function(){
        if (this.memory.e == ENERGY_NEED){
            this.obtainEnergy({
                container: [CONTAINER_TYPE_SOURCE],
                storage: true,
            });
        }else{
            // 没有找到下个目标的情况下，返回false，并且把工作置为IDLE
            if (!this.setNextTarget()){
                this.setWorkState(WORK_IDLE);
                return;
            }
            const target = this.getTargetObject() as SpawnEnergyStoreStructure;
            // 目标如果不存在就跳过该目标
            // 例如目标被拆除了
            if (!target){
                delete this.room.memory.taskSpawn[this.memory.t!];
                this.clearTarget();
            }
            if (this.store.getFreeCapacity() > 0 && (target.store.getFreeCapacity(RESOURCE_ENERGY) > this.store[RESOURCE_ENERGY])){
                this.memory.e = ENERGY_NEED;
                this.unshiftTarget();
                this.obtainEnergy({
                    container: [CONTAINER_TYPE_SOURCE],
                    storage: true,
                });
            }else{
                const result = this.transfer(target, RESOURCE_ENERGY);
                switch(result){
                    case OK:
                        // 如果当前的容量不足以填满目标，则将目标放回队列里
                        if (this.store[RESOURCE_ENERGY] >= target.store.getFreeCapacity(RESOURCE_ENERGY)){
                            delete this.room.memory.taskSpawn[this.memory.t!];
                            this.clearTarget();
                        }else{
                            this.unshiftTarget();
                        }
                        break;
                    case ERR_NOT_IN_RANGE:
                        this.moveTo(target);
                        break;
                }
            }

        }
    }

    // ------------------------------------------------------
    // 塔能量搬运
    // ------------------------------------------------------

}
