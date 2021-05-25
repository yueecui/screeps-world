interface RoomMemory {
  towers: Array<Id<StructureTower>>;
}


interface Room {
  getTower(): Array<Id<StructureTower>>;
}


