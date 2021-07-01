import { LINK_TYPE_CONTROLLER, LINK_TYPE_NONE, LINK_TYPE_SOURCE, LINK_TYPE_STORAGE, TRUE } from "@/common/constant";

export default function () {
    Object.defineProperty(StructureLink.prototype, 'info', {
        get: function () {
            if (this._info === undefined){
                const info = _.find(this.links as linkInfo[], { id: this.id });
                if (info == undefined){
                    this._info = null;
                    this.room.memory.flagPurge = TRUE;
                }else{
                    this._info = info;
                }
            }
            return this._info;
        },
        set: function (new_value: linkInfo) {
            this._info = new_value;
        },
        enumerable: false,
        configurable: true
    });

    StructureLink.prototype.work = function(){
        // global.cache.links
        if (!this.info) return;
        switch(this.info.type){
            case LINK_TYPE_NONE:
            case LINK_TYPE_SOURCE:
                if (this.store.getFreeCapacity(RESOURCE_ENERGY) == 0){
                    this.sendToCenter()
                }
                break;
            case LINK_TYPE_CONTROLLER:
                if (this.store[RESOURCE_ENERGY] <= 24){
                    this.requestFromCenter();
                }
                break;
            case LINK_TYPE_STORAGE:
                if (this.info.target){
                    this.centerSendToTarget();
                }
                break;
        }
    }

    StructureLink.prototype.sendToCenter = function(){
        const storage_link = this.room.storageLink;
        if (!storage_link) return;
        // 如果目标本tick已经有接收能量了，则跳过
        if (global.cache.links[storage_link.id] == TRUE) return;

        if (this.transferEnergy(storage_link) == OK){
            global.cache.links[storage_link.id] = TRUE;
        }
    }

    StructureLink.prototype.requestFromCenter = function(){
        const storage_link = this.room.storageLink;
        if (!storage_link) return;
        storage_link.info.target = this.id;
    }

    StructureLink.prototype.requestFromCenter = function(){
        const storage_link = this.room.storageLink;
        if (!storage_link) return;
        storage_link.info.target = this.id;
    }

    StructureLink.prototype.centerSendToTarget = function(){
        const target = Game.getObjectById(this.info.target!);
        // 目标已有足够的能力，停止任务
        if (!target || target.store[RESOURCE_ENERGY] >= 776){
            delete this.info.target;
            return;
        }
        if (this.store.getFreeCapacity(RESOURCE_ENERGY) == 0){
            if (this.transferEnergy(target) == OK){
                delete this.info.target;
                return;
            }
        }else{
            this.createCenterTask(this.store.getFreeCapacity(RESOURCE_ENERGY), true);
        }
    }

    StructureLink.prototype.createCenterTask = function(amount, is_input){
        // 最后到这
    }
}
