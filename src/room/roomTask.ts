// 孵化
// 控制器
// 塔
// 额外能量存储到storage
// 拣墓碑
// 拣废墟

import { TASK_HARU_SPAWN_ENERGY, TASK_NORMAL_SPAWN_ENERGY } from "@/module/constant"



export default function () {
    Room.prototype.addTask = function(){
        this.memory.tasks.push({
            type: TASK_NORMAL_SPAWN_ENERGY,
            source: 'fsdafasd' as Id<StructureStorage>,
            target: 'fsdafasd' as Id<StructureExtension>,
            cargo: {
                [RESOURCE_ENERGY]: 1
            }
        })

        const a = this.memory.tasks[0];

        if (a.type == TASK_NORMAL_SPAWN_ENERGY){
            a.target
        }else if (a.type == TASK_HARU_SPAWN_ENERGY){
            test(a as Task<TASK_HARU_SPAWN_ENERGY>)
        }
    }

    function test(a: Task<TASK_HARU_SPAWN_ENERGY>) {

    }
}
