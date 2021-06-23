// 孵化
// 控制器
// 塔
// 额外能量存储到storage
// 拣墓碑
// 拣废墟

import { BOOLEAN_TRUE, CONTAINER_TYPE_NONE, CONTAINER_TYPE_SOURCE, TASK_PRIORITY_HIGH, TASK_PRIORITY_LOW, TASK_PRIORITY_MIDDLE, TASK_TOWER_ENERGY } from "@/common/constant";


export default function () {
    Room.prototype.createTask = function(task_info, priority=TASK_PRIORITY_LOW) {
        // 检查是否已添加
        if (this.hasTask(task_info)) return false;
        // 补充、修正任务数据
        this.taskIndex = this.taskIndex ?? 0 + 1;
        task_info.id = 'T' + Game.time % 10000 * 100 + this.taskIndex;
        task_info.createTime = Game.time;

        // 推入任务流
        switch (priority){
            case TASK_PRIORITY_LOW:
                this.tasks.push(task_info);
                break;
            case TASK_PRIORITY_MIDDLE:
                // TODO
                break;
            case TASK_PRIORITY_HIGH:
                this.tasks.unshift(task_info);
                break;
        }

        // 标记任务已发布
        switch (task_info.type){
            case TASK_TOWER_ENERGY:
                this.taskStatus[task_info.object] = task_info.id;break;
        }

        return true;
    }

    Room.prototype.hasTask = function(task_info){
        if (this.taskStatus == undefined) this.taskStatus = {};
        switch (task_info.type){
            case TASK_TOWER_ENERGY:
                return this.taskStatus[task_info.object] != undefined;
        }
        console.log(`Room.hasTask遇到意料外的任务类型：${task_info.type}`)
        return false
    }

    // 分配任务
    Room.prototype.assignTask = function() {
        if (this.carriers.length == 0) return;
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
                object: task.object,
                cargo: this.sendTask(task, carriers_available[0])
            }, TASK_PRIORITY_HIGH);
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

    Room.prototype.getCommonSource = function() {
        if (!this.my) return []

        const result = [];
        if (this.storage) result.push(this.storage);
        if (this.terminal) result.push(this.terminal);
        if (result.length > 0) return result;
        // 只有没有storage和terminal时才去查container
        for (const info of this.memory.data.containers.filter(info => info.type == CONTAINER_TYPE_SOURCE || info.type == CONTAINER_TYPE_NONE)){
            const container = Game.getObjectById(info.id);
            if (container){
                result.push(container);
            }else{
                this.memory.flagPurge = BOOLEAN_TRUE;
            }
        }
        return result;
    }
}
