export class ConsoleCommandRoom {
    public _name: string = '';

    constructor(room_name: string){
        this._name = room_name;
    }

    get room(){
        if (Game.rooms[this._name]) {
            return Game.rooms[this._name];
        }else{
            console.log(`[${this._name}] 没有视野`)
            return null;
        }
    }

    showEnergy(){
        if (!this.room) return -1;
        return this.room.storage ? this.room.storage.store[RESOURCE_ENERGY] : -2;
    }
}
