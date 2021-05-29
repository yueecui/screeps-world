import { roomExtensionBase } from './base';
import { roomExtensionContainer } from './container';
import { roomExtensionSpawn } from './spawn';


import { TASK_WAITING, CONTAINER_TYPE_SOURCE, PLAN_INCOME, PLAN_PAY } from "@/constant";

const CONTAINER_TO_STORAGE_MIN = 1500;

export const roomExtension = function () {
    roomExtensionBase();
    roomExtensionContainer();
    roomExtensionSpawn();

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

    // energy container相关
    Room.prototype.getFullSourceContainers = function(){
        let containers = _.map(this.memory.containers, (c) => {
            return c.type == CONTAINER_TYPE_SOURCE ? this.getStructureById(c.id) : null;
        });

        return _.filter(containers, (container) => {
            if (container == null) { return false; }
            return this.getStructureEnergyCapacity(container) >= CONTAINER_TO_STORAGE_MIN; }
        ) as StructureContainer[];
    };
}
