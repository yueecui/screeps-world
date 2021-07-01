interface StructureLink{
    info: linkInfo;

    work(): void;

    // 将能量发送到storage
    sendToCenter(): void;
    // 向storage请求能量
    requestFromCenter(): void;

    centerSendToTarget(): void;

    // 创建搬运任务
    createCenterTask(amount: number, is_input: boolean): void;

}
