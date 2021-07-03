import { LINK_TYPE_CONTROLLER, LINK_TYPE_NONE, LINK_TYPE_SOURCE, LINK_TYPE_STORAGE, TASK_CATEGORY_CENTER, TASK_CENTER_LINK_INPUT, TASK_CENTER_LINK_OUTPUT, TRUE } from "@/common/constant";

export default function () {
    Object.defineProperty(StructureLink.prototype, 'info', {
        get: function () {
            if (this._info === undefined){
                const info = _.find(this.room.links as linkInfo[], { id: this.id });
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
                // 没有目标时，请求将自己的能量搬运走
                else if (this.store[RESOURCE_ENERGY] > 0){
                    this.createCenterTask(this.store[RESOURCE_ENERGY], TASK_CENTER_LINK_OUTPUT);
                }
                break;
        }
    }

    StructureLink.prototype.sendToCenter = function(){
        const storage_link = this.room.storageLink;
        if (!storage_link) return;
        // 如果目标本tick已经有接收能量了，则跳过
        if (Game.status.links[storage_link.id] == TRUE) return;

        if (this.transferEnergy(storage_link) == OK){
            Game.status.links[storage_link.id] = TRUE;
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
        // 目标已有足够的能量，停止任务
        if (!target || target.store[RESOURCE_ENERGY] >= 776){
            delete this.info.target;
            return;
        }
        // 自己能量满就发送，不足就请求补充能量
        if (this.store.getFreeCapacity(RESOURCE_ENERGY) == 0){
            if (this.transferEnergy(target) == OK){
                delete this.info.target;
            }
        }else{
            this.createCenterTask(this.store.getFreeCapacity(RESOURCE_ENERGY), TASK_CENTER_LINK_INPUT);
        }
    }

    StructureLink.prototype.createCenterTask = function(amount, task_type){
        this.room.createTask({
            type: task_type,
            category: TASK_CATEGORY_CENTER,
            object: this.id,
            cargo: {
                [RESOURCE_ENERGY]: amount
            }
        });
    }
}
