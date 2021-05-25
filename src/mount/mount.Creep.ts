import { roleHarvester } from '@/creeps/role.Harvester'
import { roleTransporter } from '@/creeps/role.Transporter'
import { roleBuilder } from '@/creeps/role.Builder'
import { roleUpgrader } from '@/creeps/role.Upgrader'

const roleMap: Record<AnyRoleName, AnyRole> = {
    '采集': roleHarvester,
    '运输': roleTransporter,
    '建造': roleBuilder,
    '升级': roleUpgrader,
}

export const creepExtension = function () {
    Creep.prototype.baseName = '';
    Creep.prototype.index = 0;
    Creep.prototype.recycling = false;

    Creep.prototype.run = function(){
        // if (this.getRole() == 'Upgrader'){
        //     return roleMap['Builder'].run(this);
        // }
        console.log(this.getRole());
        if (roleMap[this.getRole()]){
            roleMap[this.getRole()].run(this);
        }else{
            console.log('没有找到角色:'+this.getRole());
        }
    };

    Creep.prototype.analyzeName = function () {
        const find = /([^\d]+)(\d+)/.exec(this.name);
        if (find){
            this.baseName = find[1];
            this.index = parseInt(find[2]) || 0;
            return true;
        }else{
            this.baseName = '未知';
            this.index = 0;
            return false;
        }
    }

    Creep.prototype.getBasename = function () {
        if (this.baseName == null){
            this.analyzeName();
        }
        return this.baseName;
    }

    Creep.prototype.getRole = function(){
        if (this.memory.r){
            return this.memory.r;
        }else if (this.memory.role){
            return this.memory.role;
        }else{
            return '采集';
        }
    }
    Creep.prototype.getIndex = function(){
        if (this.index == null){
            this.analyzeName();
        }
        return this.index;
    }

    Creep.prototype.getTarget = function(){
        return this.memory.t ? Game.getObjectById(this.memory.t) : null;
    }

    // 拾取虫子周围掉落的能量
    // 返回值
    // OK -> 拾取成功
    // ERR_FULL -> 当前剩余存储量太多
    // ERR_NOT_FOUND -> 没有找到合适的目标
    Creep.prototype.recycleNearby = function(res_type = RESOURCE_ENERGY){
        if (this.store.getFreeCapacity() == 0){
            return ERR_FULL;
        }
        // this.recycling = false;
        // 判断拾取附近的墓碑
        const find_tombstone = this.room.find(FIND_TOMBSTONES, { filter: (obj) => { return obj.store[res_type] && this.pos.isNearTo(obj); } })
        for (const find of find_tombstone){
            this.withdraw(find, res_type);
            this.recycling = true;
            break;
        }
        // 判断拾取附近的废墟
        const find_ruins = this.room.find(FIND_RUINS, { filter: (obj) => { return obj.store[res_type] && this.pos.isNearTo(obj); } })
        for (const find of find_ruins){
            this.withdraw(find, res_type);
            this.recycling = true;
            break;
        }
        // 判断拾取附近的掉落物
        const find_dropped = this.room.find(FIND_DROPPED_RESOURCES, { filter: (obj) => { return obj.resourceType == res_type && this.pos.isNearTo(obj); } });
        for (const find of find_dropped){
            // 采集者不拿已经堆满的container上的掉落能量
            if (this.memory.r == "采集"){
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
            break;
        }
        if (this.recycling){
            return OK;
        }else{
            return ERR_NOT_FOUND;
        }
    }

    // 返回本回合执行recycleNearby是否成功
    // 成功的情况下，在其他代码里需要阻拦其他withdraw和pickup操作
    Creep.prototype.isRecycling = function () {
        return this.recycling;
    }

    // 从Room中离当前自己最近的container获取能量
    Creep.prototype.obtainEnergyFromNearestContainer = function(capacity_min){
        // if (this.room.storage && this.room.storage.store[RESOURCE_ENERGY] > 0){
        //     if (this.withdraw(this.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
        //         this.moveTo(this.room.storage)
        //     }
        //     return;
        // }
        capacity_min = capacity_min || 0;
        let target = Game.getObjectById(this.memory.t!);
        if (!(target && target.structureType == STRUCTURE_CONTAINER && target.storeCapacity)){
            let find_containers = this.room.find(FIND_STRUCTURES, {filter: function(st){
                return (st.structureType == STRUCTURE_CONTAINER && st.storeCapacity && st.store[RESOURCE_ENERGY] > capacity_min)
            }});

            find_containers.sort((a, b) => {
                return this.pos.getRangeTo(a) - this.pos.getRangeTo(b);
            });
            target = find_containers[0];
        }

        if (this.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
            this.moveTo(target)
        }
    }
}
