import { TOWER_ENERGY_NEED_ADD } from "@/common/config";
import { TASK_PRIORITY_LOW, TASK_PRIORITY_MEDIUM, TASK_TOWER_ENERGY } from "@/common/constant";

// const TOWER_POWER_ATTACK = 600;
// const TOWER_FALLOFF = 30;
// const TOWER_OPTIMAL_RANGE = 5;
// const TOWER_FALLOFF_RANGE = 20;

export default function () {
    StructureTower.prototype.work = function(){
        // 寻找敌对
        const closestHostile = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            this.attack(closestHostile);
            return;
        }

        // 寻找我方
        const my_creep = this.room.find(FIND_MY_CREEPS, {filter: (creep) => {
            return creep.hits < creep.hitsMax;
        }});
        if (my_creep.length){
            this.heal(my_creep[0]);
            return;
        }

        // 寻找需要修理的rampart
        const found = this.room.find(FIND_MY_STRUCTURES, {filter: (struct) => {
            return struct.structureType == STRUCTURE_RAMPART && struct.hits < 300;
        }})
        if (found.length){
            this.repair(found[0]);
        }

        // 检查能量
        if (Game.rooms.sim){
            this.checkStatus();
        }

    }

    StructureTower.prototype.checkStatus = function () {
        if (this.store[RESOURCE_ENERGY] >= TOWER_ENERGY_NEED_ADD) return;
        this.room.createTask({
            type: TASK_TOWER_ENERGY,
            priority: TASK_PRIORITY_MEDIUM,
            object: this.id,
            cargo: {
                [RESOURCE_ENERGY]: Math.min(TOWER_CAPACITY, this.store.getFreeCapacity(RESOURCE_ENERGY))
            }
        });
    }

    StructureTower.prototype.calcDamage = function (target){
        let range = this.pos.getRangeTo(target);
        let amount = TOWER_POWER_ATTACK;
        if(range > TOWER_OPTIMAL_RANGE) {
            if(range > TOWER_FALLOFF_RANGE) {
                range = TOWER_FALLOFF_RANGE;
            }
            amount -= amount * TOWER_FALLOFF * (range - TOWER_OPTIMAL_RANGE) / (TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE);
        }
        [PWR_OPERATE_TOWER, PWR_DISRUPT_TOWER].forEach(power => {
            const effect = _.find(this.effects, {power: power}) as PowerEffect | undefined;
            if (effect && effect.ticksRemaining > 0) {
                amount *= POWER_INFO[power].effect[effect.level-1];
            }
        });
        return Math.floor(amount);
    }

}
