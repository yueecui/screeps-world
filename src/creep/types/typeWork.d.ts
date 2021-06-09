interface Creep{
    /** 采集者待机时的检查状态 */
    harvesterIdleCheck(): void;
    /**
     * 采集者错误检查
     * @returns true表示有错误，false表示无错误
     */
    harvesterErrorCheck(): boolean;
    /** 采集者移动到采集点 */
    harvesterGoTo(): void;
    /** 执行 WORK_HARVEST */
    harvesterDoWork(): void;
    /** 采集者执行 WORK_REPAIR */
    harvesterDoWorkRepair(): void;

    /**
     * 升级者
     * @returns true表示有错误，false表示无错误
     */
    upgraderErrorCheck(): boolean;
    /** 执行 WORK_UPGRADE */
    upgraderDoWork(): void;




    /**
     * 查找房间内可以建造的目标，如果找到就
     * 不足的情况下会设工作状态为WORK_TRANSPORTER_SPAWN
     * @returns 是否找到
     */
    findBuildTarget(): boolean;
}
