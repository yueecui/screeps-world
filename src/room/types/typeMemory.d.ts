interface RoomMemory {
    /**
     * 强制清除缓存的标记
     */
    flagPurge: BOOL_ANY;
    /**
     * 本房间最后一次孵化的时间
     *
     * 用于判断是否要再次进行孵化
     */
    lastSpawnTime: number;
    /**
     * 当前还需要补充能量的孵化用建筑物
     */
    taskSpawn: Record<string, taskInfo>;

    /**
     * 当前还需要补充能量的塔
     */
    taskTowers: Record<string, taskInfo>;

    /**
     * 目前运输的能量计划
     *
     * 用于辅助计算能量存储建筑可用能量
     */
    energyPlan: EnergyPlan[];

    /** 房间数据，这部分数据删掉后会完全自动重置 */
    data: {
        sources: sourceInfo[],
        mineral: mineralInfo | null,
        containers: containerInfo[],
        links: linkInfo[];
        towers: Id<StructureTower>[];
        controller: controllerInfo,
        storage: storageInfo,
    }
    /** 当前房间的状态，用于判断 */
    status: {
        /** 房间里有敌人 */
        underAttack: BOOL_ANY;
        /** 仅限预定房间，有敌方的core在抢预定 */
        hasInvaderCore?: BOOL_ANY;
        /** 控制器的LINK是否需要能量 */
        controllerLinkNeedEnergy?: BOOL_ANY;
    }
    /** 房间配置，这部分数据均为手工配置的数据，删了的话需要重新配置 */
    roomConfig: {
        /** 生成creep的前缀 */
        code: string;
        /** 生成剩余能量的位置 */
        resShowPos: [number, number];
        /** 每个元素是一个外矿房间名 */
        outside: string[];
        /** wall的hp数值 */
        wallHp?: number;
        /** rampart低于这个数值时，开始修理 */
        rampartHpMin?: number;
        /** rampart每次修理到这个数值 */
        rampartHpMax?: number;
    }
    /** 孵化配置，这部分数据为手工数据，删除的话会重置回默认 */
    spawnConfig: {
        /** 各role数量，不指定或是为-1的时候采取自动配置 */
        amount: Record<string, number>
        /** 各role提前生成时间，主要是生成后到工作位置的到位时间 */
        advance: Record<string, number>
    }
    /** creep配置，这部分数据为手工数据，删除的话会重置回默认 */
    creepConfig: {
        /** 各roll stay的位置配置 */
        stay: Record<string, [number, number]>
    }
}

/** source的配置数据 */
interface sourceInfo{
    id: Id<Source>;
    container: Id<StructureContainer> | null;
    link: Id<StructureLink> | null;
    /** 工作坐标 */
    workPos: [number, number];
}

/** mineral的配置数据 */
interface mineralInfo{
    id: Id<Mineral>;
    container: Id<StructureContainer> | null;
}

/** container的配置数据 */
 interface containerInfo{
    id: Id<StructureContainer>;
    type: ANY_CONTAINER_TYPE;
}

type ANY_CONTAINER_TYPE =
        | CONTAINER_TYPE_NONE
        | CONTAINER_TYPE_SOURCE
        | CONTAINER_TYPE_CONTROLLER
        | CONTAINER_TYPE_MINERAL;
type CONTAINER_TYPE_NONE = 0;   // 未设定
type CONTAINER_TYPE_CONTROLLER = 1;    // 用于给upgrader提取能量的container
type CONTAINER_TYPE_SOURCE = 2;    // 临接source的container，存量变多后会转移到storage
type CONTAINER_TYPE_MINERAL = 3;    // 临接mineral的container，存量变多后会转移到storage


/** link的配置数据 */
interface linkInfo{
    id: Id<StructureLink>;
    type: ANY_LINK_TYPE;
}

type ANY_LINK_TYPE =
        | LINK_TYPE_NONE
        | LINK_TYPE_SOURCE
        | LINK_TYPE_CONTROLLER
        | LINK_TYPE_STORAGE

/** 未设定类型 */
type LINK_TYPE_NONE = 0;
/** 临接storage的link */
type LINK_TYPE_STORAGE = 1;
/** 临接controller的link */
type LINK_TYPE_CONTROLLER = 2;
/** 临接source的link */
type LINK_TYPE_SOURCE = 3;

/** controller的能量来源 */
interface controllerInfo{
    id: Id<StructureLink | StructureContainer> | null;
    type: STRUCTURE_CONTAINER | STRUCTURE_LINK | null;
    workPos: [number, number][];
}

interface storageInfo{
    link: Id<StructureLink> | null;
}

/**
 * source缓存的状态（预计过期）
 */
 interface sourceNodeInfo {
    /**
     * source ID
     */
    s: Id<Source>|Id<Mineral>;
    /**
     * 对应的container
     *
     * 当Room.addContainer执行时，会判断新添加的container是不是在某个source周围1格，
     * 如果是的话会进行关联绑定
     */
    c: Id<StructureContainer> | null;
}

/**
 * 任务信息状态
 */
 interface taskInfo{
    cName: string | null;
    stat: TASK_STATUS;
}

type TASK_STATUS =
        | TASK_WAITING
        | TASK_ACCEPTED;

type TASK_WAITING = 0;
type TASK_ACCEPTED = 1;


/**
 * 运输中的能量计划
 */
interface EnergyPlan{
    cName: string,
    sid: Id<StructureContainer>,
    t: PLAN_TYPE,
    a: number,
}

type PLAN_TYPE =
        | PLAN_INCOME
        | PLAN_PAY;
type PLAN_INCOME = 0; // 预计收入
type PLAN_PAY = 1;    // 预计支出

