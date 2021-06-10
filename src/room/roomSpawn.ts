import { TASK_WAITING } from "@/global/constant";

export default function () {

    // 根据房间等级获取扩展的最大容量
    Room.prototype.getExtensionMaxCapacity = function(){
        if (this.controller){
            switch(this.controller.level){
                case 1:
                    return 0;
                case 7:
                    return 100;
                case 8:
                    return 200;
                default:
                    return 50;
            }
        }else{
            return 0;
        }
    }

    // 检查孵化用能量是否充足
    Room.prototype.checkSpawnEnergy = function(){
        if (this.memory.lastSpawnTime == 0 || !(this.memory.lastSpawnTime < Game.time)){
            return;
        }
        // 查找所有能量不满的孵化用建筑
        const found = this.find(FIND_MY_STRUCTURES, {filter: (find) => {
            return ((find.structureType == STRUCTURE_SPAWN|| find.structureType == STRUCTURE_EXTENSION)
                    && find.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
        }}) as AnySpawnEnergyStoreStructure[];

        const newtaskSpawn = {} as Record<string, taskInfo>;
        found.forEach((find) => {
            // 将ID存储到Memory
            if (find.id in this.memory.taskSpawn){
                const oldTaskInfo = this.memory.taskSpawn[find.id];
                if (oldTaskInfo.cName && Game.creeps[oldTaskInfo.cName]){
                    newtaskSpawn[find.id] = oldTaskInfo;
                    return;
                }
            }
            newtaskSpawn[find.id] = {
                cName: null,
                stat: TASK_WAITING,
            }
        })
        this.memory.taskSpawn = newtaskSpawn;
        // 关闭标记
        this.memory.lastSpawnTime = 0;
    }

    // 获得所有没进入孵化能量补充队列的建筑
    Room.prototype.getUnqueueTaskSpawn = function(){
        const id_list: Id<AnySpawnEnergyStoreStructure>[] = [];
        if (Object.keys(this.memory.taskSpawn).length > 0){
            _.each(this.memory.taskSpawn, (info, k) => {
                if (info.stat == TASK_WAITING){
                    id_list.push(k as Id<AnySpawnEnergyStoreStructure>);
                };
            });
        }
        const result: AnySpawnEnergyStoreStructure[] = [];
        for (const id of id_list){
            const struct = Game.getObjectById(id);
            if (struct){
                result.push(struct);
            }else{
                delete this.memory.taskSpawn[id];
            }
        }
        return result;
    }

    // 是否有还未进入队列的孵化能量建筑
    Room.prototype.hasUnqueueTaskSpawn = function(){
        for (const key in this.memory.taskSpawn){
            if (this.memory.taskSpawn[key].stat == TASK_WAITING){
                return true;
            }
        }
        return false;
    }
}
