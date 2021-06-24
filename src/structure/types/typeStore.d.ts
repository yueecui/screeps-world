// 由于没法扩展Store
// 改为拓展使用Store的建筑信息
interface StructureStorage{
    calcStore(resource_name: ResourceConstant): number;
}
