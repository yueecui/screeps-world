import {
    ENERGY_NEED, ENERGY_ENOUGH,
    WORK_IDLE, WORK_TRANSPORTER_SPAWN, WORK_TRANSPORTER_TOWER, WORK_TRANSPORTER_STORAGE_ENERGY, WORK_TRANSPORTER_TOMBSTONE,
    TASK_WAITING, TASK_ACCEPTED,
    CONTAINER_TYPE_SOURCE,
    WORK_TRANSPORTER_CONTROLLER,
    PRIORITY_CONTAINER,
    WORK_TRANSPORTER_STORAGE_MINERAL,
    TASK_TOWER_ENERGY,
    TASK_STATUS_ORDER,
    TASK_STATUS_DELIVER,
    TASK_STATUS_INIT,
    TASK_STATUS_OBTAIN,
} from '@/common/constant';
import { ICON_PAUSE, ICON_QUESTION_MARK_1, ICON_SEARCH_1, ICON_SEARCH_2 } from '@/common/emoji';


export default function () {
    // ------------------------------------------------------
    // 检查是否拥有可以完成任务的存储量
    // ------------------------------------------------------
    Creep.prototype.hasEnoughCapacity = function(task) {
        let need_capacity = 0;
        for (const name in task.cargo){
            need_capacity += task.cargo[name as ResourceConstant]!;
        }
        return this.store.getCapacity() >= need_capacity;
    };

    // ------------------------------------------------------
    // 检查是否现在持有足够的货物
    // ------------------------------------------------------
    Creep.prototype.hasEnoughCargo = function(task) {
        for (const name in task.cargo){
            if (this.store[name as ResourceConstant] < task.cargo[name as ResourceConstant]!){
                return false;
            }
        }
        return true;
    };

    // ------------------------------------------------------
    // 预定货物
    // ------------------------------------------------------
    Creep.prototype.orderCargo = function(task, room) {
        if (room == undefined) return false;
        const cargo_sources = room.getCommonSource();
        if (cargo_sources.length == 0) return false;
        if (task.order == undefined) task.order = [];

        for (const name in task.cargo){
            let need = task.cargo[name as ResourceConstant]! - this.store[name as ResourceConstant];
            if (need <= 0) continue;
            for (const source of cargo_sources){
                // TODO:这里应该读取的是计算过其他订单占用后的数量
                if (source.store[name as ResourceConstant] >= need){
                    task.order.push({
                        id: source.id,
                        room: source.room.name,
                        type: name as ResourceConstant,
                        amount: need
                    });
                    need = 0;
                    break;
                }
            }
            // 如果所有源都没有足够的货物，则返回false
            if (need > 0) return false;
        }
        return true;
    };

    // ------------------------------------------------------
    // 接受发布过来的新任务
    // 只接受自己容量够的部分，其他的部分作为返回值发送回去，供拆分
    // ------------------------------------------------------
    Creep.prototype.acceptTask = function (task) {
        let accept_cargo: TaskCargo = {};
        let remain_cargo: TaskCargo = {};
        let remain_capacity = this.store.getCapacity();

        for (const name in task.cargo){
            let amount = task.cargo[name as ResourceConstant]!;
            if (remain_capacity > 0){
                if (remain_capacity > amount){
                    accept_cargo[name as ResourceConstant] = amount;
                    remain_capacity = remain_capacity - amount;
                    amount = 0;
                }else{
                    accept_cargo[name as ResourceConstant] = remain_capacity;
                    amount = amount - remain_capacity;
                    remain_capacity = 0;
                }
            }
            if (amount > 0){
                remain_cargo[name as ResourceConstant] = amount
            }
        }
        task.cargo = accept_cargo;
        // 分配来的搬运任务排到最后
        this.taskQueue.push(task.id!);

        return remain_cargo;
    }


    // ------------------------------------------------------
    // 执行任务
    // ------------------------------------------------------
    Creep.prototype.doTask = function () {
        if (this.taskQueue.length == 0){
            this.say(Game.time%2==0? ICON_SEARCH_1:ICON_SEARCH_2);
            return false;
        }
        const task = Memory.rooms[this.workRoom].taskDoing[this.taskQueue[0]];
        if (task == undefined){
            this.taskQueue.splice(0, 1);
            return this.doTask();
        }
        // 根据任务类型执行不同操作
        switch (task.type){
            case TASK_TOWER_ENERGY:
                return this.doTaskTowerEnergy(task as Task<TASK_TOWER_ENERGY>);
        }

        return false;
    }

    // ------------------------------------------------------
    // 完成任务
    // ------------------------------------------------------
    Creep.prototype.completeTask = function (task) {
        this.removeTask(task);
    }

    // ------------------------------------------------------
    // 取消任务
    // 任务直接删除掉
    // ------------------------------------------------------
    Creep.prototype.removeTask = function (task, recreate=false) {
        // 因为不一定有视野，所以直接操作Memory
        const room_memory = Memory.rooms[this.workRoom];
        delete room_memory.taskDoing[task.id!];

        // 是否重新添加任务到队列
        if (recreate) {
            delete task.acceptTime;
            delete task.creep;
            delete task.state;
            delete task.order;
            room_memory.tasks.push(task);
        }else{
            switch(task.type){
                case TASK_TOWER_ENERGY:
                    delete room_memory.taskStatus[task.object];
                    break;
            }
        }

        // 移除掉任务队伍队列
        _.pull(this.taskQueue, task.id);
    }

    // ------------------------------------------------------
    // 预定货物
    // ------------------------------------------------------
    Creep.prototype.orderCargo = function(task, room) {
        if (room == undefined) return false;
        const cargo_sources = room.getCommonSource();  // TODO:必要的时候可能需要从LINK取能量
        if (cargo_sources.length == 0) return false;
        if (task.order == undefined) task.order = [];

        for (const name in task.cargo){
            let need = task.cargo[name as ResourceConstant]! - this.store[name as ResourceConstant];
            if (need <= 0) continue;
            for (const source of cargo_sources){
                if (source.getCalcCapacity(name as ResourceConstant) >= need){
                    task.order.push({
                        id: source.id,
                        room: source.room.name,
                        type: name as ResourceConstant,
                        amount: need
                    });
                    need = 0;
                    break;
                }
            }
            // 如果所有源都没有足够的货物，则返回false
            if (need > 0) return false;
        }
        return true;
    };

    // ------------------------------------------------------
    // 按预定取得货物
    // ------------------------------------------------------
    Creep.prototype.obtainCargo = function(task) {
        if (task.order && task.order.length > 0) {
            const room = Game.rooms[task.order[0].room];
            if (!room){
                this.moveTo(new RoomPosition(25, 25, task.order[0].room));
                return true;
            }
            const target = Game.getObjectById(task.order[0].id);
            if (target == null){
                // 目标失踪的话重新寻找源来预定货物
                task.order.splice(0, task.order.length);
                task.state = TASK_STATUS_ORDER;
                return false;
            }
            if (this.pos.isNearTo(target)){
                // TODO：考虑下如果是storage，可以顺手存东西
                const result = this.withdraw(target, task.order[0].type, task.order[0].amount);
                if (result == OK){
                    task.order.splice(0, 1);
                }
            }else{
                this.moveTo(target);
            }
            return true;
        }else{
            // 没有货物需要取了，进入下一步送货
            task.state = TASK_STATUS_DELIVER;
            return false;
        }
    };


    // ------------------------------------------------------
    // 执行任务：给塔补充能量
    // ------------------------------------------------------
    Creep.prototype.doTaskTowerEnergy = function (task) {
        switch(task.state ?? TASK_STATUS_INIT){
            case TASK_STATUS_INIT:  // 初始化
                task.state = this.hasEnoughCargo(task) ? 3 : 1;
                return this.doTaskTowerEnergy(task);
            case TASK_STATUS_ORDER:  // 从源预定货物
                if (this.orderCargo(task, Game.rooms[this.workRoom])){
                    task.state = TASK_STATUS_OBTAIN;
                    return this.doTaskTowerEnergy(task);
                }else{
                    this.say(ICON_PAUSE);
                    return false;
                }
            case TASK_STATUS_OBTAIN:  // 从预定的源里获取货物
                return this.obtainCargo(task) ? true : this.doTaskTowerEnergy(task);
            case TASK_STATUS_DELIVER:  // 运送货物去目的地中
                const target = Game.getObjectById(task.object);
                // 目标不存在时取消任务
                if (target == null) {
                    this.removeTask(task);
                    return false;
                }
                if (this.pos.isNearTo(target)){
                    for (const name in task.cargo){
                        const result = this.transfer(target, name as ResourceConstant, task.cargo[name as ResourceConstant]);
                        if (result == OK){
                            delete task.cargo[name as ResourceConstant];
                            if (Object.keys(task.cargo).length == 0){
                                this.completeTask(task);
                            }
                            return true;
                        }
                    }
                }else{
                    this.moveTo(target);
                }
                return true;
        }
    }


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
                // terminal: true,
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
            const room = Game.rooms[this.workRoom];
            const empty_containers = room.getEmptyControllerContainers();
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
                container: [CONTAINER_TYPE_SOURCE],
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
                return tomestone.store.getUsedCapacity() > 0 && (tomestone.creep.owner.username == 'Invader' || tomestone.ticksToDecay < 150);
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
            const room = Game.rooms[this.workRoom]!;
            if (this.pos.isNearTo(room.storage!)){
                for (const name in this.store){
                    this.transfer(room.storage!, name as ResourceConstant);
                }
            }else{
                this.moveTo(room.storage!);
            }
        }else{
            this.work = WORK_IDLE;
        }
    }
}
