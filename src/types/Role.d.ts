type BodyConfig = Array<BodyPartConstant>;

interface RoleConfig{
  basename?: string;
  body: BodyConfig | null;
  amount: number;
  aheadTime?: number;
  memory: CreepMemory;
}

type AnyRoleName =
    | RoleNameHarvester
    | RoleNameTransporter
    | RoleNameBuilder
    | RoleNameUpgrader;

type RoleNameHarvester = '采集';
type RoleNameTransporter = '运输';
type RoleNameBuilder = '建造';
type RoleNameUpgrader = '升级';


interface CreepRole {
  run(creep: Creep): void;
  updateStatus(creep: Creep): void;
  execute(creep: Creep): void;
}

type AnyRole =
    | Harvester
    | Transporter
    | Builder
    | Upgrader;

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
