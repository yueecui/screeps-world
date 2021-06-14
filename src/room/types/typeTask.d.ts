interface Task{
    from: string
    to: string
    cargo: Record<ResourceConstant, number>
    done: () => any;
}

interface Room {
    /** 巡查任务 */
    inspectTask(): void;
}


// 先存到Memory里
// 后面稳定再改到global里
interface RoomMemory {
    tasks: Task[]
}
