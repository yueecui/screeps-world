interface Room {
  /**
   * 添加一个container
   *
   * 这个方法一般手工调用
   * @param id 需要添加的container id
   * @param type container的类型，用于用途判断
   */
 addContainer(id: Id<StructureContainer>, type: ANY_CONTAINER_TYPE): void;
 /**
  * 移除一个container
  *
  * 这个方法会在定期检查时自动调用
  * @param id 需要移除的container id
  */
 removeContainer(id: Id<StructureContainer>): void;
 /**
  * 周期性检查container，移除不存在的
  */
 checkContainerStatus(): void;
 /**
  * 预定要变化container的energy
  *
  * @param creep_iname 预定使用的creep name
  * @param container_id 预定的container id
  * @param type 预定类型（是存入还是取出）
  * @param amount 预定数量
  */
  bookingContainer(creep_name: string, container_id: Id<StructureContainer>, type: PLAN_TYPE, amount: number): void;
  /**
   * 取消预定要变化container的energy
   *
   * @param id 需要取消预定的creep id，会取消该creep的所有预定
   */
  unbookingContainer(creep_name: string): void;
  /**
   * 获取指定id的container在计算预定额度后的能量数值
   *
   * @param structure 指定的continaer或是storage
   * @returns number 计算额度后的能量数值
   */
  getStructureEnergyCapacity(structure: StructureContainer | StructureStorage): number;

  /**
   * 试图添加source对应的container
   */
  addSourceContainer(container: StructureContainer): void;
  /**
  * 移除了一个container，检查是否为source对应的，如果是就移除
  */
  removeSourceContainer(container_id: Id<StructureContainer>): void;
  /**
   * 获取房间内已经接近满的source container
   *
   * 获取到的将安排任务转存到storage中
   */
  getFullSourceContainers(): StructureContainer[];
  /**
   * 获取房间内已经接近满的mineral container
   *
   * 获取到的将安排任务转存到storage中
   */
  getFullMineralContainers(): StructureContainer[];
  /**
   * 获取房间内已经要空的controller container
   */
  getEmptyControllerContainers(): StructureContainer[];
}
