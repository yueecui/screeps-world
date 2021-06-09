import { CONTAINER_TYPE_CONTROLLER, CONTAINER_TYPE_SOURCE, CONTAINER_TYPE_MINERAL, PLAN_PAY } from "@/utils/constant";
import { CONTROLLER_CONTAINER_EMPTY, SOURCE_CONTAINER_FULL, MINERAL_CONTAINER_FULL } from "@/utils/config"

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

    // 获得接近全满的source container
    Room.prototype.getFullSourceContainers = function(){
        let containers = _.map(this.containers, (c) => {
            return c.type == CONTAINER_TYPE_SOURCE ? Game.getObjectById(c.id) : null;
        });

        return _.filter(containers, (container) => {
            if (container == null) { return false; }
            return this.getStructureEnergyCapacity(container) >= SOURCE_CONTAINER_FULL; }
        ) as StructureContainer[];
    };

    // 获得接近全满的mineral container
    Room.prototype.getFullMineralContainers = function(){
        let containers = _.map(this.containers, (c) => {
            return c.type == CONTAINER_TYPE_MINERAL ? Game.getObjectById(c.id) : null;
        });

        return _.filter(containers, (container) => {
            if (container == null) { return false; }
            return container.store.getUsedCapacity() >= MINERAL_CONTAINER_FULL; }
        ) as StructureContainer[];
    };

    // 获得接近空的controller container
    Room.prototype.getEmptyControllerContainers = function(){
        let containers = _.map(this.containers, (c) => {
            return c.type == CONTAINER_TYPE_CONTROLLER ? Game.getObjectById(c.id) : null;
        });

        return _.filter(containers, (container) => {
            if (container == null) { return false; }
            return this.getStructureEnergyCapacity(container) < CONTROLLER_CONTAINER_EMPTY; }
        ) as StructureContainer[];
    };
}
