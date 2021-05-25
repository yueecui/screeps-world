export const roomExtension = function () {
    Room.prototype.getTower = function(): Array<Id<StructureTower>>{
        const memory = this.memory as RoomMemory
        if (!memory.towers){
            const find_tower = this.find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_TOWER }}) as Array<StructureTower>;
            memory.towers = find_tower.map((t: StructureTower) => {return t.id});
        }
        return memory.towers;
    }
}
