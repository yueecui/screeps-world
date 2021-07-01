import { FALSE, TRUE, LINK_TYPE_CONTROLLER, LINK_TYPE_NONE, LINK_TYPE_SOURCE, LINK_TYPE_STORAGE } from "@/common/constant";

export default function () {
    // 定义各个属性
    Object.defineProperty(Room.prototype, 'sources', {
        get: function () {
            if (this.memory.data && this.memory.data.sources.length == 0){
                const found = this.find(FIND_SOURCES) as Source[];
                found.sort((a, b) => {
                    return a.pos.x == b.pos.x ? a.pos.y - b.pos.y : a.pos.x - b.pos.x;
                })
                for (const source of found){
                    this.memory.data.sources.push({
                        id: source.id,
                        container: null,
                        link: null,
                        workPos: [0, 0],
                    })
                }
            }
            return this.memory.data.sources;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Room.prototype, 'mineral', {
        get: function () {
            if (this.memory.data && this.memory.data.mineral == null){
                const found = this.find(FIND_MINERALS) as Mineral[];
                if (found.length > 0){
                    this.memory.data.mineral = {
                        id: found[0].id,
                        container: null,
                    };
                }
            }
            return this.memory.data.mineral;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Room.prototype, 'containers', {
        get: function () {
            if (this.memory.data && this.memory.data.containers == null){
                this.memory.data.containers = [];
            }
            return this.memory.data.containers;
        },
        set: function(new_value: containerInfo[]){
            this.memory.data.containers = new_value;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Room.prototype, 'links', {
        get: function () {
            if (this.memory.data && this.memory.data.links == null){
                this.memory.data.links = [];
            }
            return this.memory.data.links;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Room.prototype, 'towers', {
        get: function () {
            if (this.memory.data && this.memory.data.towers == null){
                this.memory.data.towers = [];
            }
            return this.memory.data.towers;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Room.prototype, 'spawns', {
        get: function () {
            return _.filter(Game.spawns, (spawn) => { return spawn.room.name == this.name; });
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Room.prototype, 'code', {
        get: function () {
            if (this.memory && this.memory.roomConfig){
                return this.memory.roomConfig.code;
            }else{
                return this.name;
            }
        },
        set: function (new_value: string) {
            this.memory.roomConfig.code = new_value;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Room.prototype, 'spawnConfig', {
        get: function () {
            if (!this.memory.spawnConfig){
                this.memory.spawnConfig = {};
            }
            return this.memory.spawnConfig;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Room.prototype, 'my', {
        get: function () {
            return this.controller && this.controller.my;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Room.prototype, 'myReserve', {
        get: function () {
            return this.controller
                   && this.controller.reservation
                   && this.controller.reservation.username == 'Yuee';
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Room.prototype, 'storageLink', {
        get: function () {
            if (this._storageLink === undefined){
                const info = _.find(this.links as linkInfo[], { type: LINK_TYPE_STORAGE });
                if (info == undefined){
                    this._storageLink = null;
                }else{
                    this._storageLink = Game.getObjectById(info.id);
                    if (this._storageLink == null){
                        this.memory.flagPurge = TRUE;
                    }else{
                        this._storageLink.info = info;
                    }
                }
            }
            return this._storageLink;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Room.prototype, 'controllerLink', {
        get: function () {
            if (this._controllerLink === undefined){
                const info = _.find(this.links as linkInfo[], { type: LINK_TYPE_CONTROLLER });
                if (info == undefined){
                    this._controllerLink = null;
                }else{
                    this._controllerLink = Game.getObjectById(info.id);
                    if (this._controllerLink == null){
                        this.memory.flagPurge = TRUE;
                    }else{
                        this._controllerLink.info = info;
                    }
                }
            }
            return this._controllerLink;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Room.prototype, 'sourceLinks', {
        get: function () {
            if (this._sourceLinks === undefined){
                this._sourceLinks = [] ;
                for (const info of _.filter(this.links as linkInfo[], (info)=>{ return info.type == LINK_TYPE_SOURCE || info.type == LINK_TYPE_NONE })){
                    const link = Game.getObjectById(info.id);
                    if (link) {
                        link.info = info;
                        this._sourceLinks.push(link);
                    }
                    else this.memory.flagPurge = TRUE;
                }
            }
            return this._sourceLinks;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Room.prototype, 'carriers', {
        get: function () {
            if (this._carries === undefined){
                this._carries = _.filter(Game.creeps, creep => !creep.spawning && creep.workRoom == this.name && creep.role == '运输');
            }
            return this._carries;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Room.prototype, 'task', {
        get: function () {
            if (this.memory.task === undefined) this.memory.task = {};
            if (this.memory.task.high === undefined) this.memory.task.high = [];
            if (this.memory.task.medium === undefined) this.memory.task.medium = [];
            if (this.memory.task.low === undefined) this.memory.task.low = [];
            if (this.memory.task.doing === undefined) this.memory.task.doing = {};
            if (this.memory.task.status === undefined) this.memory.task.status = {};
            return this.memory.task;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Room.prototype, 'tasks', {
        get: function () {
            if (this.memory.tasks === undefined){
                this.memory.tasks = [];
            }
            return this.memory.tasks;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Room.prototype, 'taskDoing', {
        get: function () {
            if (this.memory.taskDoing === undefined){
                this.memory.taskDoing = {};
            }
            return this.memory.taskDoing;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Room.prototype, 'taskStatus', {
        get: function () {
            if (this.memory.taskStatus === undefined){
                this.memory.taskStatus = {};
            }
            return this.memory.taskStatus;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Room.prototype, 'sada', {
        get: function () {
            return global.cache.rooms[this.name].sadaData;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Room.prototype, 'energyOrder', {
        get: function () {

            return global.cache.rooms[this.name].energyOrder;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Room.prototype, 'isUnderAttack', {
        get: function () {
            return this.memory.status.underAttack == TRUE;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Room.prototype, 'hasInvaderCore', {
        get: function () {
            if (this.myReserve){
                return this.memory.status.hasInvaderCore == TRUE;
            }else{
                return false;
            }
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Room.prototype, 'controllerLinkNeedEnergy', {
        get: function () {
            if (this.my){
                return this.memory.status.controllerLinkNeedEnergy == TRUE;
            }else{
                return false;
            }
        },
        set: function (new_value: boolean) {
            this.memory.status.controllerLinkNeedEnergy = new_value ? TRUE : FALSE;
        },
        enumerable: false,
        configurable: true
    });
}
