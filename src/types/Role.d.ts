type AnyRoleName =
    | RoleNameHarvester
    | RoleNameTransporter
    | RoleNameBuilder
    | RoleNameUpgrader;

declare const RoleNameHarvester: RoleNameHarvester;
declare const RoleNameTransporter: RoleNameTransporter;
declare const RoleNameBuilder: RoleNameBuilder;
declare const RoleNameUpgrader: RoleNameUpgrader;

type RoleNameHarvester = '采集';
type RoleNameTransporter = '运输';
type RoleNameBuilder = '建造';
type RoleNameUpgrader = '升级';


interface CreepRole {
  run(creep: Creep): void;
}

type AnyRole =
    | Harvester
    | Transporter
    | Builder
    | Upgrader;

interface Harvester extends CreepRole{
  updateWorkStatus(creep: Creep): void;
  execute(creep: Creep): void;
}

interface Transporter extends CreepRole{
  updateEnergy(creep: Creep): void;
  updateStatus(creep: Creep): void;
  execute(creep: Creep): void;
  obtainEnergy(creep: Creep): void;
  findStore(creep: Creep): StructureExtension|StructureSpawn|null;
}

interface Builder extends CreepRole{
  updateWorkStatus(creep: Creep): void;
  execute(creep: Creep): void;
  findRepairTarget(creep: Creep): Structure|null;
  repairTarget(creep: Creep, target: Structure): void;
  findBuildTarget(creep: Creep): ConstructionSite|null;
  buildTarget(creep: Creep, target:ConstructionSite): void;
}

interface Upgrader extends CreepRole{
  updateWorkStatus(creep: Creep): void;
  execute(creep: Creep): void;
}

