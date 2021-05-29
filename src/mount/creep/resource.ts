import {
    RoleNameHarvester,
    ENERGY_NEED, ENERGY_ENOUGH,
    PLAN_PAY
} from '@/constant';

export const creepExtensionResource = function () {
    // 更新虫子当前的能量状态
    Creep.prototype.updateEnergyStatus = function(){
        if (this.getEnergyState() == ENERGY_NEED && this.store.getFreeCapacity() == 0){
            this.setEnergyState(ENERGY_ENOUGH);
        }else if (this.getEnergyState() == ENERGY_ENOUGH && this.store[RESOURCE_ENERGY] == 0){
            this.setEnergyState(ENERGY_NEED);
        }
    },

    // 从房间里存储器获取能量
    Creep.prototype.obtainEnergy = function(opt){
        if (this.store.getFreeCapacity() == 0){
            this.setEnergyState(ENERGY_ENOUGH);
        }
        let target = this.getTargetObject() as StructureContainer | StructureStorage | null;

        if (!target || (target.structureType != STRUCTURE_CONTAINER && target.structureType != STRUCTURE_STORAGE)){
            target = this.findEnergyStore(opt);
        }

        if (target){
            if (this.pos.isNearTo(target)){
                // 如果本回合拾取过能量则跳过获取阶段
                if (this.isRecycling()){
                    return;
                }
                if (this.withdraw(target, RESOURCE_ENERGY) == OK){
                    this.clearTarget();
                    this.setEnergyState(ENERGY_ENOUGH);
                    this.room.unbookingContainer(this.name);
                };
            }else{
                this.moveTo(target);
            }
        }else{
            this.say('无法获得能量')
        }
    },

    Creep.prototype.findEnergyStore = function(opt){
        let structures: Array<StructureContainer | StructureStorage> = [];
        if (opt && opt.container){
            _.each(
                _.filter(this.room.memory.containers, (config) => {
                    return opt!.container!.indexOf(config.type) > -1;
                }),
                (config) => {
                    const container = this.room.getStructureById(config.id);
                    if (container && container.store[RESOURCE_ENERGY] > 0){
                        structures.push(container);
                    }
                }
            )
        }
        if ((opt
            && opt.storage != undefined ? opt.storage : true)
            && this.room.storage
            && this.room.storage.store[RESOURCE_ENERGY] > 0){
            structures.push(this.room.storage)
        }
        // 根据最小需求量过滤
        const min_amount = opt && opt.min_amount ? opt.min_amount : this.store.getFreeCapacity(RESOURCE_ENERGY);
        structures = _.filter(structures, (structure) => {
            return this.room.getStructureEnergyCapacity(structure) >= min_amount;
        });
        if (structures.length > 0){
            structures.sort((a, b) => {
                return this.pos.getRangeTo(a) - this.pos.getRangeTo(b);
            })
            const structure = structures[0];
            this.memory.t = structure.id;
            if (structure.structureType == STRUCTURE_CONTAINER){
                this.room.bookingContainer(this.name, structure.id, PLAN_PAY, this.store.getFreeCapacity(RESOURCE_ENERGY));
            }
            return structure;
        }else{
            this.room.unbookingContainer(this.name);
            this.memory.t = null;
            return null;
        }
    }


    // 拾取虫子周围掉落的能量
    Creep.prototype.recycleNearby = function(res_type = RESOURCE_ENERGY){
        if (this.store.getFreeCapacity() == 0){
            return false;
        }
        // 判断拾取附近的掉落物
        const find_dropped = this.room.find(FIND_DROPPED_RESOURCES, { filter: (obj) => { return obj.resourceType == res_type && this.pos.isNearTo(obj); } });
        for (const find of find_dropped){
            // 采集者不拿已经堆满的container上的掉落能量
            if (this.memory.r == RoleNameHarvester){
                const lookfor_container = this.room.lookAt(find).filter((r) => {
                    return (r.type == 'structure'
                            && (r.structure as StructureContainer).structureType == STRUCTURE_CONTAINER
                            && (r.structure as StructureContainer).store.getFreeCapacity(RESOURCE_ENERGY) == 0
                            );
                });
                if (lookfor_container.length > 0){
                    continue;
                }
            }
            this.pickup(find);
            this.recycling = true;
            return true;
        }
        // this.recycling = false;
        // 判断拾取附近的墓碑
        const find_tombstone = this.room.find(FIND_TOMBSTONES, { filter: (obj) => { return obj.store[res_type] && this.pos.isNearTo(obj); } })
        for (const find of find_tombstone){
            this.withdraw(find, res_type);
            this.recycling = true;
            return true;
        }
        // 判断拾取附近的废墟
        const find_ruins = this.room.find(FIND_RUINS, { filter: (obj) => { return obj.store[res_type] && this.pos.isNearTo(obj); } })
        for (const find of find_ruins){
            this.withdraw(find, res_type);
            this.recycling = true;
            return true;
        }

        return false;
    }

    // 返回本回合执行recycleNearby是否成功
    // 成功的情况下，在其他代码里需要阻拦其他withdraw和pickup操作
    Creep.prototype.isRecycling = function () {
        return this.recycling;
    }
}
