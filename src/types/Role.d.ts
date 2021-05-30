interface RoleConfig{
  basename?: string;
  body: BodyPartConstant[] | null;
  amount: number;
  aheadTime?: number;
  memory: Record<string, any>;
}

type ANY_ROLE_NAME =
    | ROLE_GOTO_RECYCLE
    | ROLE_HARVESTER
    | ROLE_TRANSPORTER
    | ROLE_BUILDER
    | ROLE_UPGRADER
    | ROLE_ATTACKER
    | ROLE_ENGINEER;

type ROLE_GOTO_RECYCLE = '回收';
type ROLE_HARVESTER = '采集';
type ROLE_TRANSPORTER = '运输';
type ROLE_BUILDER = '建造';
type ROLE_UPGRADER = '升级';
type ROLE_ATTACKER = '攻击';
type ROLE_ENGINEER = '工兵';


interface CreepRole {
  run(creep: Creep): void;
  updateStatus(creep: Creep): void;
  execute(creep: Creep): void;
}

type AnyRole =
    | GoToRecycle
    | Harvester
    | Transporter
    | Builder
    | Upgrader
    | Attacker
    | Engineer;

interface GoToRecycle extends CreepRole{

}

interface Harvester extends CreepRole{
}

interface Transporter extends CreepRole{
}

interface Builder extends CreepRole{

  findRepairTarget(creep: Creep): Structure|null;
  repairTarget(creep: Creep, target: Structure): void;
  findBuildTarget(creep: Creep): ConstructionSite|null;
  buildTarget(creep: Creep, target:ConstructionSite): void;
}

interface Upgrader extends CreepRole{
}

interface Attacker extends CreepRole{
}

interface Engineer extends CreepRole{

}
