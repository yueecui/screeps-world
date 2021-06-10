import roleHarvester from '@/creep/role/Harvester';
import roleTransporter from '@/creep/role/Transporter';
import roleBuilder from '@/creep/role/Builder';
import roleUpgrader from '@/creep/role/Upgrader';
import roleAttacker from '@/creep/role/Attacker';
import roleEngineer from '@/creep/role/Engineer';
import roleGoToRecycle from '@/creep/role/GoToRecycle';
import roleManual from '@/creep/role/Manual';
import roleMastermind from '@/creep/role/Mastermind';
import roleScout from '@/creep/role/Scout';

import {
    ENERGY_NEED,
    WORK_TRANSPORTER_SPAWN, WORK_TRANSPORTER_TOWER, WORK_TRANSPORTER_STORAGE_ENERGY,
    TASK_WAITING, TASK_ACCEPTED, MODE_NONE, WORK_IDLE,
} from '@/global/constant';

// 任务队列最大长度
const TASK_QUEUE_MAX = 5;

const roleMap: Record<ANY_ROLE_NAME, (creep: Creep) => void> = {
    '回收': roleGoToRecycle,
    '手动': roleManual,

    '采集': roleHarvester,
    '运输': roleTransporter,
    '建造': roleBuilder,
    '升级': roleUpgrader,
    '主脑': roleMastermind,

    '斥候': roleScout,
    '工兵': roleEngineer,
    '攻击': roleAttacker,
}

export default function () {
    Creep.prototype.run = function(){
        if (this.spawning){
            return;
        }
        if (this.role){
            roleMap[this.role](this);
        }else{
            this.say('没有配置角色');
        }
    };

    Creep.prototype.analyzeName = function () {
        if (this.named){
            this._roomCode = '无';
            this._baseName = this.name;
            this._index = 0;
        }else{
            const find = /^(.+)-(.+?)(\d*)$/.exec(this.name);
            if (find){
                this._roomCode = find[1];
                this._baseName = find[2];
                this._index = parseInt(find[3]) || 0;
            }else{
                this.say('名字解析错误')
                this._roomCode = '?';
                this._baseName = '未知'
                this._index = 0;
            }
        }
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
        if (this.target){
            return true;
        }
        // 更新队列
        let result = this.acceptTaskSpawn();
        // 从队列里获取第一个目标，如果没有则完成事务
        if (result){
            this.target = _.head(this.memory.queue!);
            this.memory.queue = _.drop(this.memory.queue!);
            return true;
        }else{
            this.target = null;
            return false;
        }
    }

    // 从Room.taskSpawn接取任务
    Creep.prototype.acceptTaskSpawn = function(){
        // 队列不存在的话，获取一下队列
        if (!this.memory.queue || this.memory.queue.length == 0){
            let targets;
            // 获取目标队列
            switch(this.work){
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
                switch(this.work){
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
        let stay;
        if (this.room.memory.creepConfig.stay[this.baseName]){
            stay =  this.room.memory.creepConfig.stay[this.baseName];
        }else if (this.memory.stay){
            stay = this.memory.stay;
        }
        if (stay){
            let y;
            if (this.room.countBaseNameCreeps(this.baseName) == 1){
                y = stay[1];
            }else{
                y = stay[1]-1+this.index;
            }
            const pos = new RoomPosition(stay[0], y, this.room.name);
            if (this.pos.getRangeTo(pos) > 0){
                this.moveTo(pos);
            }
        }
    }
}
