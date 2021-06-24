const getCalcCapacity = function (name:ResourceConstant, structure: AnyStoreStructure) {
    let capacity = structure.store[name];
    if (capacity == 0) return 0;
    for (const name in structure.room.taskDoing){
        const task = structure.room.taskDoing[name];
        if (!task.order) continue;
        for (const order of task.order){
            if (order.id == structure.id && order.type == name){
                capacity -= order.amount;
            }
        }
    }
    return capacity < 0 ? 0 : capacity;
}

export default function () {
    StructureStorage.prototype.getCalcCapacity = function (name) {
        return getCalcCapacity(name, this);
    }
    StructureTerminal.prototype.getCalcCapacity = function (name) {
        return getCalcCapacity(name, this);
    }
    StructureContainer.prototype.getCalcCapacity = function (name) {
        return getCalcCapacity(name, this);
    }
}
