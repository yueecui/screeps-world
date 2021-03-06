/*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
                You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
*/
// // Memory extension samples
// interface Memory {
//     uuid: number;
//     log: any;
// }

// interface CreepMemory {
//     role: string;
//     room: string;
//     working: boolean;
// }

// Syntax for adding proprties to `global` (ex "global.log")

declare namespace NodeJS {
    interface Global {
        log: any;

        update(): void;

        // 定春布局范围
        haru: any;

        // 各类缓存
        cache: {
            rooms: Record<string, RoomCache>
        }
    }
}

interface RoomCache{
    /** 是否初始化完成 */
    init: boolean
    /** 可用的孵化能量记录，变化的时候需要重新索引haru */
    energy: number
    /** haru设置 */
    sadaData?: SadaData
    /** 孵化时使用的能量顺序 */
    energyOrder?: (Id<StructureExtension|StructureSpawn>)[]
}
interface Game{
    /** 当前所有活着的工蚁统计，每轮刷新 */
    allLivedCreeps: Record<string, LivedCreeps>
    /** 本回合开始孵化的虫子，避免重复孵化 */
    spawningInTick: string[]
    /** 每tick状态记录 */
    status: {
        links: Record<string, BOOL_ANY>  // 标记link是否为忙碌，忙碌的link表示当前tick已经有接受能量
    }
}

interface Memory{
    /** 临时用旗标，什么都可以写 */
    tempFlags: Record<string, any>;
    /** 老的roomCode */
    roomCodeReplace: Record<string, string>;

    sadaharuConfigs: Record<string, SadaharuConfig>
}

type BOOL_ANY =
    | FALSE
    | TRUE

type FALSE = 0
type TRUE = 1

type LivedCreeps = Record<string, number[]>;
