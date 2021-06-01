interface Creep{
    /**
     * 采集能量的错误检查
     * @returns true表示有错误，false表示无错误
     */
    errorCheckHarvestEnergy(): boolean;
    /**
     * 前往能量采集点
     */
    goToSourceNode(): void;
    /**
     * 执行 WORK_HARVEST_ENERGY
     */
    doWorkHarvestEnergy(): void;
    /**
     * 检查资源点状态，如果资源点回复，则返回采集模式
     */
    checkSourceNodeEnergy(): void;
    /**
     * 采集者执行 WORK_REPAIR
     */
    doWorkRepair_Harvester(): void;
    /**
     * 采集矿物的错误检查
     * @returns true表示有错误，false表示无错误
     */
    errorCheckHarvestMineral(): boolean;
    /**
     * 前往矿藏采集点
     */
    goToMineralNode(): void;
     /**
      * 执行 WORK_HARVEST_ENERGY
      */
    doWorkHarvestMineral(): void;

    /**
     * 执行 WORK_UPGRADE
     */
    doWorkUpgrade(): void;

    /**
     * 查找房间内可以建造的目标，如果找到就
     * 不足的情况下会设工作状态为WORK_TRANSPORTER_SPAWN
     * @returns 是否找到
     */
    findBuildTarget(): boolean;
}
