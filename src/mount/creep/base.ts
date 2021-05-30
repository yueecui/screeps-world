import { roleHarvester } from '@/creeps/role.Harvester';
import { roleTransporter } from '@/creeps/role.Transporter';
import { roleBuilder } from '@/creeps/role.Builder';
import { roleUpgrader } from '@/creeps/role.Upgrader';
import { roleAttacker } from '@/creeps/role.Attacker';
import { roleEngineer } from '@/creeps/role.Engineer';
import { roleGoToRecycle } from '@/creeps/role.GoToRecycle';

import {
    ENERGY_NEED,
    WORK_TRANSPORTER_SPAWN, WORK_TRANSPORTER_TOWER, WORK_TRANSPORTER_STORAGE,
    TASK_WAITING, TASK_ACCEPTED, MODE_NONE, WORK_IDLE,
} from '@/constant';

// 任务队列最大长度
const TASK_QUEUE_MAX = 5;

const roleMap: Record<ANY_ROLE_NAME, AnyRole> = {
    '回收': roleGoToRecycle,
    '采集': roleHarvester,
    '运输': roleTransporter,
    '建造': roleBuilder,
    '升级': roleUpgrader,
    '攻击': roleAttacker,
    '工兵': roleEngineer,
}

export const creepExtensionBase = function () {
    Creep.prototype.baseName = '';
    Creep.prototype.index = 0;
    Creep.prototype.recycling = false;

    Creep.prototype.run = function(){
        if (this.spawning){
            return;
        }
        if (this.getRole() == undefined){
            this.say('没有配置角色');
        }else{
            roleMap[this.getRole()].run(this);
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
            this.index = -1;
            return false;
        }
    }

    Creep.prototype.getBasename = function () {
        if (this.baseName == ''){
            this.analyzeName();
        }
        return this.baseName;
    }
    Creep.prototype.getIndex = function(){
        if (this.index == 0){
            this.analyzeName();
        }
        return this.index;
    }

    Creep.prototype.getRole = function(){
        return this.memory.r;
    }

    Creep.prototype.getMode = function(){
        return this.memory.mode == undefined ? MODE_NONE : this.memory.mode;
    }

    Creep.prototype.setWorkState = function(state){
        this.memory.w = state;
    }

    Creep.prototype.getWorkState = function(){
        return this.memory.w;
    }

    Creep.prototype.setEnergyState = function(state){
        this.clearEnergyTarget();
        this.memory.e = state;
    }

    Creep.prototype.getEnergyState = function(){
        return this.memory.e;
    }

    Creep.prototype.setTarget = function(id){
        this.memory.t = id;
    }

    Creep.prototype.getTarget = function(){
        return this.memory.t;
    }

    Creep.prototype.getTargetObject = function(){
        return this.memory.t ? Game.getObjectById(this.memory.t) : null;
    }

    Creep.prototype.clearTarget = function(){
        this.memory.t = null;
    }

    Creep.prototype.setEnergyTarget = function(id){
        this.memory.et = id;
    }

    Creep.prototype.getEnergyTarget = function(){
        return this.memory.et ? this.memory.et : null;
    }

    Creep.prototype.getEnergyTargetObject = function(){
        return this.memory.et ? Game.getObjectById(this.memory.et) : null;
    }

    Creep.prototype.clearEnergyTarget = function(){
        delete this.memory.et;
    }

    Creep.prototype.unshiftTarget = function(){
        if (this.memory.queue && this.memory.t){
            this.memory.queue.unshift(this.memory.t)
        }
        this.clearTarget();
    }

    Creep.prototype.inTaskQueue = function(id){
        if (this.memory.t == id){
            return true;
        }else if (this.memory.queue && this.memory.queue.indexOf(id) > -1){
            return true;
        }
        return false;
    }

    // 根据任务队列，设定下一个目标
    Creep.prototype.setNextTarget = function(){
        // 如果已经有目标了，则直接继续
        if (this.getTarget()){
            return true;
        }
        // 更新队列
        let result = this.acceptTaskSpawn();
        // 从队列里获取第一个目标，如果没有则完成事务
        if (result){
            this.setTarget(_.head(this.memory.queue!));
            this.memory.queue = _.drop(this.memory.queue!);
            return true;
        }else{
            this.clearTarget();
            return false;
        }
    }

    // 从Room.taskSpawn接取任务
    Creep.prototype.acceptTaskSpawn = function(){
        // 队列不存在的话，获取一下队列
        if (!this.memory.queue || this.memory.queue.length == 0){
            let targets;
            // 获取目标队列
            switch(this.getWorkState()){
                case WORK_TRANSPORTER_SPAWN:
                    targets = this.room.getUnqueueTaskSpawn();
                    break;
                case WORK_TRANSPORTER_TOWER:
                    targets = this.room.getUnqueueTaskTower();
                    break;
            }
            if (targets && targets.length > 0){
                // TODO 距离选择部分还可以优化
                targets.sort((a: AnyStructure, b: AnyStructure) => {
                    return this.pos.getRangeTo(a) - this.pos.getRangeTo(b);
                });
                this.memory.queue = [];
                for (const t of targets){
                    this.memory.queue.push(t.id);
                    this.room.memory.taskSpawn![t.id] = {
                        cName: this.name,
                        stat: TASK_ACCEPTED,
                    };
                    if (this.memory.queue.length > TASK_QUEUE_MAX){
                        break;
                    }
                }
            }
        }
        return (this.memory.queue != null && this.memory.queue.length > 0);
    }

    // 清除队列
    Creep.prototype.clearQueue = function(){
        if (this.memory.queue){
            for (const id in this.memory.queue){
                switch(this.getWorkState()){
                    case WORK_TRANSPORTER_SPAWN:
                        if (id in this.room.memory.taskSpawn){
                            this.room.memory.taskSpawn[id] = {
                                cName: null,
                                stat: TASK_WAITING,
                            };
                        }
                        break;
                    case WORK_TRANSPORTER_TOWER:
                        if (id in this.room.memory.taskTowers){
                            this.room.memory.taskTowers[id] = {
                                cName: null,
                                stat: TASK_WAITING,
                            };
                        }
                        break;
                }
            }
        }
        this.memory.queue = [];
    }

    // 去等待位置
    Creep.prototype.goToStay = function(){
        // this.getWorkState() == WORK_IDLE
        if (this.memory.stay){
            if (this.pos.x != this.memory.stay[0] || this.pos.y != this.memory.stay[1]){
                this.moveTo(this.memory.stay[0], this.memory.stay[1]);
            }
        }
    }
}
