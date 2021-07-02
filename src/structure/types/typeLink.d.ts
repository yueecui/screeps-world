interface StructureLink{
    info: linkInfo;

    work(): void;

    // 将能量发送到storage
    sendToCenter(): void;
    // 向storage请求能量
    requestFromCenter(): void;

    centerSendToTarget(): void;

    // 创建搬运任务
    createCenterTask(amount: number, task_type: TASK_CENTER_LINK_INPUT|TASK_CENTER_LINK_OUTPUT): void;
    cancelCanterTask(): void;
}
