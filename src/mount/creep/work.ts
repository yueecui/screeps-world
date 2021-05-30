import {
    ENERGY_NEED, ENERGY_ENOUGH,
    WORK_IDLE,
    CONTAINER_TYPE_CONTROLLER,
    WORK_HARVEST,
    WORK_GOTO,
} from '@/constant';

export const creepExtensionHarvester = function () {
    // ------------------------------------------------------
    // 采集能量
    // ------------------------------------------------------

    // 前往采集点
    Creep.prototype.errorCheckHarvest = function(){
        if (this.memory.node == undefined){
            this.say('没配置采集点');
            return true;
        }else if (this.room.memory.sources.length < this.memory.node + 1){
            this.say('没有足够的采集点');
            return true;
        }
        const source_set = this.room.memory.sources[this.memory.node];
        if (!source_set.c){
            this.say(`${this.memory.node}号没有存储容器`);
            return true;
        }
        return false;
    }

    // 前往采集点
    Creep.prototype.goToSourceNode = function(){
        if (this.errorCheckHarvest()) return;

        const source_set = this.room.memory.sources[this.memory.node];
        const container = Game.getObjectById(source_set.c!)!;

        if (this.pos.getRangeTo(container) > 0){
            this.moveTo(container);
        }else{
            this.setWorkState(WORK_HARVEST);
            this.doWorkHarvest();
        }
    }

    // 执行 WORK_HARVEST
    Creep.prototype.doWorkHarvest = function(){
        if (this.errorCheckHarvest()) return;

        const source_set = this.room.memory.sources[this.memory.node];
        const source_node = Game.getObjectById(source_set.s)!;

        if (this.pos.isNearTo(source_node)){
            this.harvest(source_node);
        }else{
            this.setWorkState(WORK_GOTO);
            this.goToSourceNode();
        }
    }

    // ------------------------------------------------------
    // 升级
    // ------------------------------------------------------

    // 执行 WORK_UPGRADE
    Creep.prototype.doWorkUpgrade = function(){
        if (this.getEnergyState() == ENERGY_NEED){
            this.obtainEnergy({
                container: [CONTAINER_TYPE_CONTROLLER],
                storage: false,
            });
        }else{
            if (this.store[RESOURCE_ENERGY] == 0){
                this.setEnergyState(ENERGY_NEED);
                this.obtainEnergy({
                    container: [CONTAINER_TYPE_CONTROLLER],
                    storage: false,
                });
            }
            if (this.pos.x != 29 || this.pos.y != 20+this.getIndex()){
                this.moveTo(29, 20+this.getIndex())
            }
            switch(this.upgradeController(this.room.controller!)){
                case ERR_NOT_ENOUGH_RESOURCES:
                    this.setEnergyState(ENERGY_NEED);
                    this.obtainEnergy({
                        container: [CONTAINER_TYPE_CONTROLLER],
                        storage: false,
                    });
                    break;
            }
        }
    }

    // ------------------------------------------------------
    // 建造
    // ------------------------------------------------------

    // 寻找一个需要建造的目标
    // 如果找到就设定上工作状态
    // Creep.prototype.findBuildTarget = function(){
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
