import { CONTAINER_TYPE_CONTROLLER, CONTAINER_TYPE_SOURCE, CONTAINER_TYPE_MINERAL, PLAN_PAY } from "@/constant";
import { CONTROLLER_CONTAINER_EMPTY, SOURCE_CONTAINER_FULL } from "@/config"

export const roomExtensionContainer = function () {
    // 预定一个container的能量变化
    Room.prototype.bookingContainer = function(creep_name, container_id, type, amount){
        if (amount == 0){
            return;
        }
        const index = _.findIndex(this.memory.energyPlan!, {cName: creep_name});
        if (index == -1){
            this.memory.energyPlan.push({
                cName: creep_name,
                sid: container_id,
                t: type,
                a: amount
            })
        }else{
            this.memory.energyPlan[index] = {
                cName: creep_name,
                sid: container_id,
                t: type,
                a: amount
            }
        }
    }

    // 原则上每个creep同一时间只会预订一个存储器，所以只指定creep ID即可
    Room.prototype.unbookingContainer = function(creep_name){
        _.remove(this.memory.energyPlan, {cName: creep_name});
    }

    // 按booking后数值计算energy数量
    Room.prototype.getStructureEnergyCapacity = function(structure){
        if (structure.structureType == STRUCTURE_STORAGE){
            return structure.store[RESOURCE_ENERGY];
        }else{
            return structure.store[RESOURCE_ENERGY] + _.sum(_.map(
                _.filter(this.memory.energyPlan, {sid: structure.id}),
                (plan) => {
                    return plan.t == PLAN_PAY ? plan.a * -1: plan.a;
                }
            ));
        }
    }

    // 添加一个source container时，判断是否在某个source边上
    Room.prototype.addSourceContainer = function(container){
        for (const status of this.memory.sources){
            const source = Game.getObjectById(status.s as Id<Source>)!;
            if (source.pos.getRangeTo(container) == 1){
                status.c = container.id;
                console.log(`container ${container.id} 成功绑定到 source ${source.id} 上`);
                return;
            }
        }
    }

    // 移除一个container时，判断是否受到影响
    Room.prototype.removeSourceContainer = function(container_id){
        for (const status of this.memory.sources){
            if (status.c == container_id){
                status.c = null;
                console.log(`source ${status.s} 解绑了原有的container（${status.c}）`);
                return;
            }
        }
    }

    // 获得接近全满的source container
    Room.prototype.getFullSourceContainers = function(){
        let containers = _.map(this.memory.data.containers, (c) => {
            return c.type == CONTAINER_TYPE_SOURCE ? Game.getObjectById(c.id) : null;
        });

        return _.filter(containers, (container) => {
            if (container == null) { return false; }
            return this.getStructureEnergyCapacity(container) >= SOURCE_CONTAINER_FULL; }
        ) as StructureContainer[];
    };

    // 获得接近全满的mineral container
    Room.prototype.getFullMineralContainers = function(){
        let containers = _.map(this.memory.data.containers, (c) => {
            return c.type == CONTAINER_TYPE_MINERAL ? Game.getObjectById(c.id) : null;
        });

        return _.filter(containers, (container) => {
            if (container == null) { return false; }
            return container.store.getUsedCapacity() >= SOURCE_CONTAINER_FULL; }
        ) as StructureContainer[];
    };

    // 获得接近空的controller container
    Room.prototype.getEmptyControllerContainers = function(){
        let containers = _.map(this.memory.data.containers, (c) => {
            return c.type == CONTAINER_TYPE_CONTROLLER ? Game.getObjectById(c.id) : null;
        });

        return _.filter(containers, (container) => {
            if (container == null) { return false; }
            return this.getStructureEnergyCapacity(container) < CONTROLLER_CONTAINER_EMPTY; }
        ) as StructureContainer[];
    };
}
