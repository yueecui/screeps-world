// 孵化
// 控制器
// 塔
// 额外能量存储到storage
// 拣墓碑
// 拣废墟

import { TRUE, CONTAINER_TYPE_NONE, CONTAINER_TYPE_SOURCE, TASK_PRIORITY_HIGH, TASK_PRIORITY_LOW, TASK_PRIORITY_MEDIUM, TASK_TOWER_ENERGY, TASK_PRIORITY_LOW_NAME, TASK_PRIORITY_MEDIUM_NAME, TASK_PRIORITY_HIGH_NAME } from "@/common/constant";


const TASK_PRIORITY_NAME_MAP: Record<TASK_PRIORITY_ANY, TASK_PRIORITY_NAME_ANY> = {
    [TASK_PRIORITY_LOW]: TASK_PRIORITY_LOW_NAME,
    [TASK_PRIORITY_MEDIUM]: TASK_PRIORITY_MEDIUM_NAME,
    [TASK_PRIORITY_HIGH]: TASK_PRIORITY_HIGH_NAME,
}

export default function () {
    Room.prototype.createTask = function(task, force=false) {
        // 非强制添加的任务，检查是否已添加
        // 强制添加用于拆分订单
        if (!force && this.hasTask(task)) return false;
        // 补充、修正任务数据
        this.taskIndex = (this.taskIndex ?? 0) + 1;
        // T表示运输任务
        task.id = 'T' + Game.time % 10000 * 100 + this.taskIndex;
        task.createTime = Game.time;

        // 推入任务流
        let queue_name = TASK_PRIORITY_NAME_MAP[task.priority];
        force ? this.task[queue_name].unshift(task) : this.task[queue_name].push(task);

        // 标记任务已发布
        if (!force){
            switch (task.type){
                case TASK_TOWER_ENERGY:
                    this.task.status[task.object] = task.id;break;
            }
        }

        return true;
    }

    Room.prototype.hasTask = function(task){
        switch (task.type){
            case TASK_TOWER_ENERGY:
                return this.task.status[task.object] != undefined;
        }
        console.log(`Room.hasTask遇到意料外的任务类型：${task.type}`)
        return false
    }

    // 分配任务
    // 任务分成高中低三条队列
    // 高队列只有能量搬运任务，主要是孵化任务
    // 中和低队列是混合任务
    // 优先执行优先级高队列的任务，高队列的任务可以强制取消其他队列的任务来优先执行
    Room.prototype.assignTaskMain = function() {
        if (this.carriers.length == 0) return;
        for (const priority of [TASK_PRIORITY_HIGH_NAME, TASK_PRIORITY_MEDIUM_NAME, TASK_PRIORITY_LOW_NAME]){
            if (priority == TASK_PRIORITY_HIGH_NAME){
                this.assignEnergyTask(this.task[priority]);
            }else{
                this.assignComplexTask(this.task[priority]);
            }
        }
    }

    // 高优先级的纯能量运送任务
    Room.prototype.assignEnergyTask = function(task_queue) {
        let carriers_available = this.carriers.filter(creep => creep.taskQueue.length == 0);
        // 在没有可用运输者时，高优先级任务会挤掉中低优先级的任务
        if (carriers_available.length == 0) carriers_available = this.carriers.filter(creep => creep.currentTaskPriority != TASK_PRIORITY_HIGH);
        // 还是没有的话则返回
        if (carriers_available.length == 0) return false;

        return true;
    }

    // 中低优先级的混合任务
    Room.prototype.assignComplexTask = function(task_queue) {
        const carriers_available = this.carriers.filter(creep => creep.taskQueue.length == 0);
        if (carriers_available.length == 0) return;
        // 容量大的优先排任务，减少CPU消耗
        carriers_available.sort((a, b) => b.store.getCapacity() - a.store.getCapacity());
        for (const carrier of carriers_available){
            const room = Game.rooms[carrier.workRoom];
            let task_id_array: string[];
            if (room && room.storage){
                task_id_array = this.assignTaskbyCapacity(task_queue, room.storage.pos, carrier.store.getCapacity());
            }else{
                task_id_array = this.assignTaskbyCapacity(task_queue, carrier.pos, carrier.store.getCapacity());
            }
            this.sendTask(carrier, task_queue, task_id_array);
            if (task_queue.length == 0) return;
        }
        // // 第一轮筛选
        // const task = this.tasks[0];
        // // TODO：还需要做距离筛选、寿命筛选
        // for (const carrier of carriers_available){
        //     if (carrier.hasEnoughCapacity(task)){
        //         this.sendTask(task, carrier);
        //         break;
        //     }
        // }
        // if (task.acceptTime) return true;
        // // 第一轮没找到合适目标（没有容量足够的目标） 则拆分订单
        // // TODO：还需要更精细的筛选规则
        // this.createTask({
        //     type: task.type,
        //     priority: task.priority,
        //     object: task.object,
        //     cargo: this.sendTask(task, carriers_available[0])
        // }, true);
        // return true;
    }


    // 拆分订单
    Room.prototype.splitTask = function (task, remain_capacity) {
        const accept_cargo: TaskCargo = {};
        const remain_cargo: TaskCargo = {};
        for (const name in task.cargo){
            const amount = task.cargo[name as ResourceConstant]!;
            if (remain_capacity == 0){
                remain_cargo[name as ResourceConstant] = amount;
            }else if (remain_capacity >= amount){
                accept_cargo[name as ResourceConstant] = amount;
                remain_capacity -= amount;
            }else{
                accept_cargo[name as ResourceConstant] = remain_capacity;
                remain_cargo[name as ResourceConstant] = amount - remain_capacity;
                remain_capacity = 0;
            }
        }

        if (_.sum(remain_cargo) > 0){
            this.createTask({
                type: task.type,
                priority: task.priority,
                object: task.object,
                cargo: remain_cargo,
            }, true);
        }
        task.cargo = accept_cargo;
    }

    // 根据目标运输者的容量获取任务
    Room.prototype.assignTaskbyCapacity = function(task_queue: Task<TASK_ANY>[], start_pos: RoomPosition, capacity: number){
        interface taskPosGroup extends _HasRoomPosition{
            task: Task<TASK_ANY>
        }

        // 将所有任务的位置都提取出来
        const task_pos_group: taskPosGroup[] = [];
        for (const task of task_queue){
            let task_pos: RoomPosition;
            switch (task.type){
                case TASK_TOWER_ENERGY:
                    const structure = Game.getObjectById(task.object as Id<AnyStructure>);
                    if (structure) task_pos = structure.pos; else continue;
                    break;
                default:
                    console.error(`没有处理的任务类型！`);
                    continue;
            }
            task_pos_group.push({
                pos: task_pos,
                task: task,
            });
        }

        let remain_capacity = capacity;
        let find_pos = start_pos;
        const assigned_task_id_array: string[] = [];
        while(remain_capacity > 0 && task_pos_group.length > 0){
            const find = find_pos.findClosestByRange(task_pos_group)!;
            const cargo_capacity = _.sum(find.task.cargo);
            if (remain_capacity >= cargo_capacity){
                remain_capacity -= cargo_capacity;
            }else{
                // 拆分订单
                this.splitTask(find.task, remain_capacity);
                remain_capacity = 0;
            }
            assigned_task_id_array.push(find!.task.id!);
            _.pull(task_pos_group, find);
            find_pos = find.pos;
        }
        return assigned_task_id_array
    }

    Room.prototype.sendTask = function (creep, task_queue, task_id_array) {
        const new_queue: Task<TASK_ANY>[] = [];
        for (const task of task_queue){
            if (_.include(task_id_array, task.id!)){
                task.acceptTime = Game.time;
                task.creep = creep.id;
                this.task.doing[task.id!] = task;
            }else{
                new_queue.push(task);
            }
        }
        task_queue.splice(0, task_queue.length, ...new_queue);
        creep.taskQueue.push(...task_id_array);
    }

    Room.prototype.getCommonSource = function(task) {
        if (!this.my) return []
        const onlyEnergy = RESOURCE_ENERGY in task.cargo && Object.keys(task.cargo).length == 1;

        const result = [];
        if (this.storage) result.push(this.storage);
        if (this.terminal) result.push(this.terminal);
        for (const info of this.containers.filter(info => info.type == CONTAINER_TYPE_NONE || (onlyEnergy && info.type == CONTAINER_TYPE_SOURCE))){
            const container = Game.getObjectById(info.id);
            if (container){
                result.push(container);
            }else{
                this.memory.flagPurge = TRUE;
            }
        }
        if (onlyEnergy){
            for (const info of this.links){
                const link = Game.getObjectById(info.id);
                if (link){
                    result.push(link);
                }else{
                    this.memory.flagPurge = TRUE;
                }
            }
        }
        return result;
    }
}
