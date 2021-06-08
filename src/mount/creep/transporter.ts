import {
    ENERGY_NEED, ENERGY_ENOUGH,
    WORK_IDLE, WORK_TRANSPORTER_SPAWN, WORK_TRANSPORTER_TOWER, WORK_TRANSPORTER_STORAGE_ENERGY, WORK_TRANSPORTER_TOMBSTONE,
    TASK_WAITING, TASK_ACCEPTED,
    CONTAINER_TYPE_SOURCE,
    WORK_TRANSPORTER_CONTROLLER,
    PRIORITY_CONTAINER,
    WORK_TRANSPORTER_STORAGE_MINERAL,
} from '@/constant';

export const creepExtensionTransporter = function () {
    // ------------------------------------------------------
    // 孵化能量搬运
    // ------------------------------------------------------

    // 检查是否需要设置工作状态为搬运孵化能量
    Creep.prototype.checkWorkTransporterSpawn = function(){
        if (this.work != WORK_TRANSPORTER_SPAWN
            && this.room.hasUnqueueTaskSpawn()){
            // 设定工作状态
            this.clearQueue();
            this.target = null;
            this.work = WORK_TRANSPORTER_SPAWN;
            this.acceptTaskSpawn();
            return true;
        }
        return false;
    }

    // 执行WORK_TRANSPORTER_SPAWN
    Creep.prototype.doWorkTransporterSpawn = function(){
        const obtain_energy = () => {
            this.obtainEnergy({
                min_amount: this.room.getExtensionMaxCapacity(),
                container: [CONTAINER_TYPE_SOURCE],
                storage: true,
            });
        }
        if (this.energy == ENERGY_NEED){
            obtain_energy();
        }else{
            // 没有找到下个目标的情况下，返回false，并且把工作置为IDLE
            if (!this.setNextTarget()){
                this.work = WORK_IDLE;
                return;
            }
            const target = Game.getObjectById(this.target!) as AnySpawnEnergyStoreStructure;
            // 目标如果不存在（被拆除）或是目标已经满了
            // 就跳过该目标
            if (!target || target.store.getFreeCapacity(RESOURCE_ENERGY) == 0){
                delete this.room.memory.taskSpawn[this.memory.t!];
                this.target = null;
            }
            if (this.store.getFreeCapacity() > 0 && (target.store.getFreeCapacity(RESOURCE_ENERGY) > this.store[RESOURCE_ENERGY])){
                this.energy = ENERGY_NEED;
                obtain_energy();
            }else{
                const result = this.transfer(target, RESOURCE_ENERGY);
                switch(result){
                    case OK:
                        // 如果容量能填满则任务完成，否则不能清除目标还得继续运能量来填
                        if (this.store[RESOURCE_ENERGY] >= target.store.getFreeCapacity(RESOURCE_ENERGY)){
                            delete this.room.memory.taskSpawn[this.memory.t!];
                            this.target = null;
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

    // 检查是否需要设置工作状态为搬运孵化能量
    Creep.prototype.checkWorkTransporterTower = function(){
        if (this.work != WORK_TRANSPORTER_TOWER
            && this.room.hasUnqueueTaskTower()){
            // 设定工作状态
            this.clearQueue();
            this.target = null;
            this.work = WORK_TRANSPORTER_TOWER;
            this.acceptTaskSpawn();
            return true;
        }
        return false;
    }

    // 执行WORK_TRANSPORTER_TOWER
    Creep.prototype.doWorkTransporterTower = function(){
        if (this.energy == ENERGY_NEED){
            this.obtainEnergy({
                container: [CONTAINER_TYPE_SOURCE],
                storage: true,
            });
        }else{
            // 没有找到下个目标的情况下，返回false，并且把工作置为IDLE
            if (!this.setNextTarget()){
                this.work = WORK_IDLE;
                return;
            }
            const target = Game.getObjectById(this.target!) as StructureTower;
            // 目标如果不存在（被拆除）或是目标已经满了
            // 就跳过该目标
            if (target == null || target.store.getFreeCapacity(RESOURCE_ENERGY) == 0){
                delete this.room.memory.taskTowers[this.memory.t!];
                this.target = null;
            }
            if (this.store.getFreeCapacity() > 0 && (target.store.getFreeCapacity(RESOURCE_ENERGY) > this.store[RESOURCE_ENERGY])){
                this.energy = ENERGY_NEED;
                this.obtainEnergy({
                    container: [CONTAINER_TYPE_SOURCE],
                    storage: true,
                });
            }else{
                const result = this.transfer(target, RESOURCE_ENERGY);
                switch(result){
                    case OK:
                        // 如果容量能填满则任务完成，否则不能清除目标还得继续运能量来填
                        if (this.store[RESOURCE_ENERGY] >= target.store.getFreeCapacity(RESOURCE_ENERGY)){
                            delete this.room.memory.taskTowers[this.memory.t!];
                            this.target = null;
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
    // 给controller container补充能量
    // ------------------------------------------------------

    // 检查
    Creep.prototype.checkWorkTransporterController = function(){
        if (this.work != WORK_TRANSPORTER_CONTROLLER){
            const empty_containers = this.room.getEmptyControllerContainers();
            if (empty_containers.length > 0){
                // 设定工作状态
                this.clearQueue();
                this.target = empty_containers[0].id;
                if (this.store[RESOURCE_ENERGY] > 0){
                    this.energy = ENERGY_ENOUGH;
                }else{
                    this.energy = ENERGY_NEED;
                }
                this.work = WORK_TRANSPORTER_CONTROLLER;
                return true;
            }
        }
        return false;
    }

    // 执行 WORK_TRANSPORTER_CONTROLLER
    Creep.prototype.doWorkTransporterController = function(){
        if (this.energy == ENERGY_NEED){
            this.obtainEnergy({
                container: [CONTAINER_TYPE_SOURCE],
                storage: true,
                priority: PRIORITY_CONTAINER,
            })
        }else{
            const target = Game.getObjectById(this.target!) as StructureContainer | null;
            // 目标如果不存在（被拆除）或是目标已经满了
            // 就跳过该目标
            if (target == null || target.store.getFreeCapacity(RESOURCE_ENERGY) == 0){
                this.target = null;
                this.work = WORK_IDLE;
                return;
            }
            if (this.store[RESOURCE_ENERGY] == 0){
                this.energy = ENERGY_NEED;
                this.obtainEnergy({
                    container: [CONTAINER_TYPE_SOURCE],
                    storage: true,
                    priority: PRIORITY_CONTAINER,
                });
            }else{
                const result = this.transfer(target, RESOURCE_ENERGY);
                switch(result){
                    case OK:
                        this.work = WORK_IDLE;
                        break;
                    case ERR_NOT_IN_RANGE:
                        this.moveTo(target);
                        break;
                }
            }
        }
    }

    // ------------------------------------------------------
    // source container转存到storage
    // ------------------------------------------------------

    // 检查是否需要设置工作状态为搬运孵化能量
    Creep.prototype.checkWorkTransporterStorage_Energy = function(){
        if (this.work != WORK_TRANSPORTER_STORAGE_ENERGY && this.room.storage){
            const full_containers = this.room.getFullSourceContainers();
            if (full_containers.length > 0){
                // 设定工作状态
                this.clearQueue();
                if (this.store.getFreeCapacity() == 0){
                    this.energy = ENERGY_ENOUGH;
                }else{
                    this.energy = ENERGY_NEED;
                }
                this.energyTarget = full_containers[0].id;
                this.work = WORK_TRANSPORTER_STORAGE_ENERGY;
                return true;
            }
        }
        return false;
    }

    // 执行 WORK_TRANSPORTER_STORAGE
    Creep.prototype.doWorkTransporterStorage_Energy = function(){
        if (this.energy == ENERGY_NEED){
            // 只从energy target中获取
            this.obtainEnergy({
                storage: false,
            })
        }else{
            const target = this.room.storage;
            // 目标如果不存在（被拆除）或是目标已经满了
            // 就跳过该目标
            if (target == null || target.store.getFreeCapacity(RESOURCE_ENERGY) == 0){
                this.target = null;
                this.work = WORK_IDLE;
                return;
            }
            const result = this.transfer(target, RESOURCE_ENERGY);
            switch(result){
                case OK:
                    this.work = WORK_IDLE;
                    break;
                case ERR_NOT_IN_RANGE:
                    this.moveTo(target);
                    break;
            }
        }
    }

    // 检查是否需要设置工作状态为搬运孵化能量
    Creep.prototype.checkWorkTransporterStorage_Mineral = function(){
        if (this.ticksToLive && this.ticksToLive < 100){
            return false;
        }
        if (this.work == WORK_TRANSPORTER_STORAGE_MINERAL){
            return true;
        }else if (this.room.storage) {
            const full_containers = this.room.getFullMineralContainers();
            if (full_containers.length > 0){
                // 设定工作状态
                this.clearQueue();
                if (this.store[RESOURCE_ENERGY] > 0){
                    this.energy = ENERGY_ENOUGH;
                    this.work = WORK_TRANSPORTER_STORAGE_ENERGY;
                    return true;
                }else{
                    this.target = full_containers[0].id;
                    this.work = WORK_TRANSPORTER_STORAGE_MINERAL;
                    return true;
                }
            }
        }
        return false;
    }

    // 执行 WORK_TRANSPORTER_STORAGE
    Creep.prototype.doWorkTransporterStorage_Mineral = function(){
        if (this.store.getUsedCapacity() == 0){
            const target = Game.getObjectById(this.target!) as StructureContainer;
            if (target == null){
                this.target = null;
                this.work = WORK_IDLE;
                return;
            }
            if (this.pos.isNearTo(target)){
                // 临时处理
                if (RESOURCE_ENERGY in target.store){
                    this.withdraw(target, RESOURCE_ENERGY);
                }else{
                    for (const name in target.store){
                        this.withdraw(target, name as ResourceConstant);
                    }
                }
            }else{
                this.moveTo(target);
            }

        }else{
            const target = this.room.storage;
            // 目标如果不存在（被拆除）或是目标已经满了
            // 就跳过该目标
            if (target == null){
                this.target = null;
                this.work = WORK_IDLE;
                return;
            }
            for (const name in this.store){
                const result = this.transfer(target, name as ResourceConstant);
                switch(result){
                    case OK:
                        this.work = WORK_IDLE;
                        break;
                    case ERR_NOT_IN_RANGE:
                        this.moveTo(target);
                        break;
                }
            }
        }
    }

    // ------------------------------------------------------
    // source container转存到storage
    // ------------------------------------------------------

    // 检查是否需要设置工作状态为搬运孵化能量
    Creep.prototype.checkWorkTransporterTombstone = function(){
        if (this.work != WORK_TRANSPORTER_TOMBSTONE && this.room.storage){
            const found = this.room.find(FIND_TOMBSTONES, { filter: (tomestone) => {
                return tomestone.creep.owner.username == 'Invader' && tomestone.store.getUsedCapacity() > 0;
            }});
            if (found.length > 0){
                // 设定工作状态
                this.clearQueue();
                if (this.store[RESOURCE_ENERGY] > 0){
                    this.energy = ENERGY_ENOUGH;
                    this.work = WORK_TRANSPORTER_STORAGE_ENERGY;
                    return true;
                }else{
                    this.work = WORK_TRANSPORTER_TOMBSTONE;
                    this.target = found[0].id;
                }
                return true;
            }
        }
        return false;
    }

    // 执行 WORK_TRANSPORTER_TOMBSTONE
    Creep.prototype.doWorkTransporterTombstone = function(){
        const target = Game.getObjectById(this.target!) as Tombstone | null;
        if (target && target.store.getUsedCapacity() > 0){
            if (this.pos.isNearTo(target)){
                for (const name in target.store){
                    this.withdraw(target, name as ResourceConstant);
                }
            }else{
                this.moveTo(target);
            }
        }else if (this.store.getUsedCapacity() > 0){
            if (this.pos.isNearTo(this.room.storage!)){
                for (const name in this.store){
                    this.transfer(this.room.storage!, name as ResourceConstant);
                }
            }else{
                this.moveTo(this.room.storage!);
            }
        }else{
            this.work = WORK_IDLE;
        }
    }
}
