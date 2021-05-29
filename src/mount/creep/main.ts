import { creepExtensionBase } from './base';
import { creepExtensionResource } from './resource';
import { creepExtensionTransporter } from './transporter';


export const creepExtension = function () {
    creepExtensionBase();
    creepExtensionResource();
    creepExtensionTransporter();

    // ------------------------------------------------------------
    // 工作事务相关
    // ------------------------------------------------------------



    // 检查是否需要设置工作状态为搬运孵化能量
    // Creep.prototype.checkWorkTransporterTower = function(){
    //     if (this.getWorkState() != WORK_TRANSPORTER_TOWER
    //         && this.room.hasUnqueueSpawnEnergyStores()){
    //             // 设定工作状态
    //             this.clearQueue();
    //             this.clearTarget();
    //             this.acceptTaskSpawn();
    //             this.setWorkState(WORK_TRANSPORTER_TOWER);
    //     }
    // },





    // 从Room中离当前自己最近的container获取能量
    Creep.prototype.obtainEnergyFromNearestContainer = function(capacity_min){
        // if (this.room.storage && this.room.storage.store[RESOURCE_ENERGY] > 0){
        //     if (this.withdraw(this.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
        //         this.moveTo(this.room.storage)
        //     }
        //     return;
        // }
        capacity_min = capacity_min || 0;
        let target = Game.getObjectById(this.memory.t!);
        if (!(target && target.structureType == STRUCTURE_CONTAINER && target.storeCapacity)){
            let find_containers = this.room.find(FIND_STRUCTURES, {filter: function(st){
                return (st.structureType == STRUCTURE_CONTAINER && st.storeCapacity && st.store[RESOURCE_ENERGY] > capacity_min)
            }});

            find_containers.sort((a, b) => {
                return this.pos.getRangeTo(a) - this.pos.getRangeTo(b);
            });
            target = find_containers[0];
        }

        if (this.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
            this.moveTo(target)
        }
    }
}
