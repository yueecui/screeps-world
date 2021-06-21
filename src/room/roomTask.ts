// 孵化
// 控制器
// 塔
// 额外能量存储到storage
// 拣墓碑
// 拣废墟

import { BOOLEAN_TRUE, CONTAINER_TYPE_NONE, CONTAINER_TYPE_SOURCE, TASK_STATUS_NONE, TASK_STATUS_PENDING, TASK_TOWER_ENERGY } from "@/common/constant";



export default function () {

    Room.prototype.assignTask = function() {
        if (this.carriers.length == 0) return;
        while (this.tasks.length > 0){
            const carriers_available = this.carriers.filter(creep => creep.task.length == 0);
            if (carriers_available.length == 0) return;
            const task = this.tasks[0];
            for (const carrier of carriers_available){
                if (carrier.hasEnoughCapacity(task)){
                    carrier.acceptTask(task);
                    _.pull(this.tasks, task);
                    this.taskDoing.push(task);
                }
            }
        }
    }


    Room.prototype.addTask = function(task_info){
        // 补充、修正任务数据

        // 标记任务已发布
        switch (task_info.type){
            case TASK_TOWER_ENERGY:
                this.memory.taskStatus[(task_info as Task<TASK_TOWER_ENERGY>).target] = TASK_STATUS_PENDING;break;
        }

        // 推入任务流
        if (this.memory.task == undefined) this.memory.task = [];
        this.memory.task.push(task_info);
    }

    Room.prototype.hasTask = function(task_info){
        if (this.memory.taskStatus == undefined) this.memory.taskStatus = {};
        switch (task_info.type){
            case TASK_TOWER_ENERGY:
                return (this.memory.taskStatus[(task_info as Task<TASK_TOWER_ENERGY>).target] ?? TASK_STATUS_NONE) > TASK_STATUS_NONE;
        }
        console.log(`Room.hasTask遇到意料外的任务类型：${task_info.type}`)
        return false
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
