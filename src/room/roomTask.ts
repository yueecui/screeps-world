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
    Room.prototype.createTask = function(task, unshift=false) {
        // 非强制添加的任务，检查是否已添加
        // 强制添加用于拆分订单
        if (!unshift && this.hasTask(task)) return false;
        // 补充、修正任务数据
        this.taskIndex = this.taskIndex ?? 0 + 1;
        // T表示运输任务
        task.id = 'T' + Game.time % 10000 * 100 + this.taskIndex;
        task.createTime = Game.time;

        // 推入任务流
        let queue_name = TASK_PRIORITY_NAME_MAP[task.priority];
        unshift ? this.task[queue_name].unshift(task) : this.task[queue_name].push(task);

        // 标记任务已发布
        switch (task.type){
            case TASK_TOWER_ENERGY:
                this.task.status[task.object] = task.id;break;
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
    Room.prototype.assignTask = function() {
        if (this.carriers.length == 0) return;
        for (const priority of [TASK_PRIORITY_LOW_NAME, TASK_PRIORITY_MEDIUM_NAME, TASK_PRIORITY_HIGH_NAME]){
            // LAST:最后做到这
            while (this.task[priority].length > 0){
                const carriers_available = this.carriers.filter(creep => creep.taskQueue.length == 0);
                if (carriers_available.length == 0) return;
            }
        }
        while (this.tasks.length > 0){
            const carriers_available = this.carriers.filter(creep => creep.taskQueue.length == 0);
            if (carriers_available.length == 0) return;
            const task = this.tasks[0];
            // 第一轮筛选
            // TODO：还需要做距离筛选、寿命筛选
            for (const carrier of carriers_available){
                if (carrier.hasEnoughCapacity(task)){
                    this.sendTask(task, carrier);
                    break;
                }
            }
            if (task.acceptTime) continue;
            // 第一轮没找到合适目标（没有容量足够的目标） 则拆分订单
            // TODO：还需要更精细的筛选规则
            this.createTask({
                type: task.type,
                priority: task.priority,
                object: task.object,
                cargo: this.sendTask(task, carriers_available[0])
            }, true);
        }
    }

    Room.prototype.sendTask = function (task, creep) {
        // 移除任务
        this.tasks.splice(0, 1);
        // 记录到doing
        this.taskDoing[task.id!] = task;
        // 更新接受任务时间
        task.acceptTime = Game.time;
        // 记录接受任务的蚂蚁
        task.creep = creep.id;
        // 返回值是creep接受完任务后，任务订单中剩余需要搬运的货物量
        return creep.acceptTask(task);
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
