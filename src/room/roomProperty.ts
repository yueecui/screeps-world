import { BOOLEAN_FALSE, BOOLEAN_TRUE, LINK_TYPE_CONTROLLER, LINK_TYPE_NONE, LINK_TYPE_SOURCE, LINK_TYPE_STORAGE } from "@/global/constant";

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
            if (!this.memory.data.spawnConfig){
                this.memory.data.spawnConfig = {};
            }
            return this.memory.data.spawnConfig;
        },
        set: function(new_value: Record<string, any>){
            this.memory.data.spawnConfig = new_value;
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
                        this.memory.flagPurge = BOOLEAN_TRUE;
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
                        this.memory.flagPurge = BOOLEAN_TRUE;
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
                    if (link) this._sourceLinks.push(link);
                    else this.memory.flagPurge = BOOLEAN_TRUE;
                }
            }
            return this._sourceLinks;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Room.prototype, 'isUnderAttack', {
        get: function () {
            return this.memory.status.underAttack == BOOLEAN_TRUE;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Room.prototype, 'hasInvaderCore', {
        get: function () {
            if (this.myReserve){
                return this.memory.status.hasInvaderCore == BOOLEAN_TRUE;
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
                return this.memory.status.controllerLinkNeedEnergy == BOOLEAN_TRUE;
            }else{
                return false;
            }
        },
        set: function (new_value: boolean) {
            this.memory.status.controllerLinkNeedEnergy = new_value ? BOOLEAN_TRUE : BOOLEAN_FALSE;
        },
        enumerable: false,
        configurable: true
    });
}
