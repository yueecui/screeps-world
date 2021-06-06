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

    Object.defineProperty(Creep.prototype, 'belong', {
        get: function () {
            return this.memory.belong ? this.memory.belong : '??';
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
            return this.memory.work ? this.memory.work : this.memory.w;
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
            return this.memory.energy ? this.memory.energy : this.memory.e;
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
