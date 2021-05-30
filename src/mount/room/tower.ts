import { TASK_WAITING } from "@/constant";

export const roomExtensionTower = function () {

    // 根据房间等级获取扩展的最大容量
    Room.prototype.getTowerMaxCapacity = function(){
        return 1000;
    }

    // 检查tower的能量
    Room.prototype.checkTowerEnergy = function(){
        if (this.memory.towers.length > 0){
            let towers = _.map(this.memory.towers, (id)=> {return this.getStructureById(id)});
            towers = _.filter(towers, (tower) => {
                if (tower == null) { this.memory.flagPurge = true;return false; }
                return tower.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            });
            this.memory.taskTowers = {};
            _.each(towers, (tower) => { this.memory.taskTowers[tower!.id] = {
                cName: null,
                stat: TASK_WAITING,
            } });
        }
    };

    // 获得所有没进入孵化能量补充队列的建筑
    Room.prototype.getUnqueueTaskTower = function(){
        const id_list: Id<StructureTower>[] = [];
        if (Object.keys(this.memory.taskTowers).length > 0){
            _.each(this.memory.taskTowers, (info, k) => {
                if (info.stat == TASK_WAITING){
                    id_list.push(k as Id<StructureTower>);
                };
            });
        }
        const [result, missed_id] = this.getStructureByIdArray(id_list);
        // 如果出现了没查到数据的建筑，则移除掉这些数据
        if (missed_id.length > 0){
            for (const id of missed_id){
                delete this.memory.taskTowers[id];
            }
        }
        return result;
    }

    // 是否有还未进入队列的孵化能量建筑
    Room.prototype.hasUnqueueTaskTower = function(){
        for (const key in this.memory.taskTowers){
            if (this.memory.taskTowers[key].stat == TASK_WAITING){
                return true;
            }
        }
        return false;
    }
}
