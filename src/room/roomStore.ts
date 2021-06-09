import { CONTAINER_TYPE_CONTROLLER, CONTAINER_TYPE_SOURCE, CONTAINER_TYPE_MINERAL, PLAN_PAY, LINK_TYPE_CONTROLLER, BOOLEAN_TRUE, LINK_TYPE_SOURCE, LINK_TYPE_NONE } from "@/module/constant";
import { CONTROLLER_CONTAINER_EMPTY, SOURCE_CONTAINER_FULL, MINERAL_CONTAINER_FULL } from "@/module/config"

export default function () {
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

    // 运转所有link
    Room.prototype.linkRun = function(){
        // controller边上的检查是否需要补充能量
        if (!this.controllerLinkNeedEnergy && this.controllerLink && this.controllerLink.store[RESOURCE_ENERGY] <= 24){
            this.controllerLinkNeedEnergy = true;
        }
        // source和none检查是否有能量可以发送
        for (const link of this.sourceLinks){
            if (link.cooldown == 0
                && link.store.getFreeCapacity(RESOURCE_ENERGY) == 0){
                    if (this.controllerLinkNeedEnergy && this.controllerLink){
                        if (link.transferEnergy(this.controllerLink) == OK){
                            this.controllerLinkNeedEnergy = false;
                            continue;
                        }
                    }
                    if (this.storageLink && this.storageLink.store.getFreeCapacity(RESOURCE_ENERGY) >= 776){
                        if (link.transferEnergy(this.storageLink) == OK){
                            continue;
                        }
                    }
            }
        }
        // storage检查是否有能量可以发送
        if (this.controllerLinkNeedEnergy
            && this.storageLink
            && this.storageLink.cooldown == 0
            && this.storageLink.store.getFreeCapacity(RESOURCE_ENERGY) == 0
            && this.controllerLink){
                if (this.storageLink.transferEnergy(this.controllerLink) == OK){
                    this.controllerLinkNeedEnergy = false;
                }
        }
    }
}
