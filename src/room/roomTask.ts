// 孵化
// 控制器
// 塔
// 额外能量存储到storage
// 拣墓碑
// 拣废墟

import { BOOLEAN_TRUE, CONTAINER_TYPE_NONE, CONTAINER_TYPE_SOURCE, TASK_TOWER_ENERGY } from "@/common/constant";


export default function () {
    Room.prototype.createTask = function(task_info) {
        // 检查是否已添加
        if (this.hasTask(task_info)) return false;
        // 补充、修正任务数据
        this.taskIndex = this.taskIndex ?? 0 + 1;
        task_info.id = Game.time % 10000 * 100 + this.taskIndex;
        task_info.createTime = Game.time;

        // 标记任务已发布
        switch (task_info.type){
            case TASK_TOWER_ENERGY:
                this.taskStatus[task_info.object] = task_info.id;break;
        }

        // 推入任务流
        if (this.memory.task == undefined) this.memory.task = [];
        this.memory.task.push(task_info);

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

    Room.prototype.assignTask = function() {
        if (this.carriers.length == 0) return;
        while (this.tasks.length > 0){
            const carriers_available = this.carriers.filter(creep => creep.task.length == 0);
            if (carriers_available.length == 0) return;
            const task = this.tasks[0];
            for (const carrier of carriers_available){
                if (carrier.hasEnoughCapacity(task)){
                    task.acceptTime = Game.time;
                    task.creep = carrier.id;

                    carrier.acceptTask(task);
                    _.pull(this.tasks, task);
                    this.taskDoing[task.id!] = task;
                }
            }
            // TODO:第二轮筛选
        }
    }

    Room.prototype.getCommonSource = function() {
        if (!this.my) return []

        const result = [];
        if (this.storage) result.push(this.storage.id);
        if (this.terminal) result.push(this.terminal.id);
        result.push(...this.memory.data.containers.filter(info => info.type == CONTAINER_TYPE_SOURCE || info.type == CONTAINER_TYPE_NONE).map(info => info.id));

        return result;
    }
}
