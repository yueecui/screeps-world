// 由于没法扩展Store
// 改为拓展使用Store的建筑信息
interface StructureStorage{
    getCalcCapacity(resource_name: ResourceConstant): number;
}

interface StructureTerminal{
    getCalcCapacity(resource_name: ResourceConstant): number;
}

interface StructureContainer{
    getCalcCapacity(resource_name: ResourceConstant): number;
}
