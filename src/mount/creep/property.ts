export const creepExtensionProperty = function () {
    // 工蚁
    Creep.prototype._roomCode = '';
    Creep.prototype._baseName = '';
    Creep.prototype._index = -1;
    Creep.prototype.recycling = false;


    Object.defineProperty(Creep.prototype, 'named', {
        get: function () {
            return this.memory.named ? true : false;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Creep.prototype, 'baseName', {
        get: function () {
            if (this.named){
                return this.name;
            }else{
                if (this._baseName == '') this.analyzeName();
                return this._baseName;
            }
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Creep.prototype, 'index', {
        get: function () {
            if (this.named){
                return 0;
            }else{
                if (this._index == -1) this.analyzeName();
                return this._index;
            }
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Creep.prototype, 'roomCode', {
        get: function () {
            if (this.named){
                return '?';
            }else{
                if (this._roomCode == '') this.analyzeName();
                return this._roomCode;
            }
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Creep.prototype, 'bornRoom', {
        get: function () {
            return this.memory.born ? this.memory.born : '??';
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Creep.prototype, 'belongRoom', {
        get: function () {
            return this.memory.belong ? this.memory.belong : this.memory.born;
        },
        set: function(new_value: string){
            this.memory.belong = new_value;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Creep.prototype, 'role', {
        get: function () {
            return this.memory.role ? this.memory.role : this.memory.r;
        },
        set: function(new_value: ANY_ROLE_NAME){
            this.memory.role = new_value;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Creep.prototype, 'mode', {
        get: function () {
            return this.memory.mode ? this.memory.mode : 0;
        },
        set: function(new_value: ANY_CREEP_MODE){
            this.memory.mode = new_value;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Creep.prototype, 'work', {
        get: function () {
            if (this.memory.work != undefined){
                return this.memory.work;
            }else{
                return this.memory.w;
            }
        },
        set: function(new_value: WORK_STATUS){
            this.memory.work = new_value;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Creep.prototype, 'target', {
        get: function () {
            return this.memory.t;
        },
        set: function(new_value: Id<any>){
            this.memory.t = new_value;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Creep.prototype, 'energy', {
        get: function () {
            if (this.memory.energy != undefined){
                return this.memory.energy;
            }else{
                return this.memory.e;
            }
        },
        set: function(new_value: ENERGY_STATUS){
            this.memory.energy = new_value;
        },
        enumerable: false,
        configurable: true
    });

    Object.defineProperty(Creep.prototype, 'energyTarget', {
        get: function () {
            return this.memory.et;
        },
        set: function(new_value: Id<AnyStoreStructure>){
            this.memory.et = new_value;
        },
        enumerable: false,
        configurable: true
    });
}
