// import { LoDashStatic } from 'lodash';

// declare global {
//     const _: LoDashStatic;
// }

/*
  Example types, expand on these or remove them and add your own.
  Note: Values, properties defined here do no fully *exist* by this type definiton alone.
        You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

  Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
  Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
*/
// // Memory extension samples
// interface Memory {
//   uuid: number;
//   log: any;
// }

// interface CreepMemory {
//   role: string;
//   room: string;
//   working: boolean;
// }

// Syntax for adding proprties to `global` (ex "global.log")
declare namespace NodeJS {
  interface Global {
    log: any;
  }
}


interface Memory{
  /** 临时用旗标，什么都可以写 */
  tempFlags: Record<string, any>;
  /** 老的roomCode */
  roomCodeReplace: Record<string, string>;
}


type ANY_BOOLEAN =
    | BOOLEAN_FALSE
    | BOOLEAN_TRUE

type BOOLEAN_FALSE = 0
type BOOLEAN_TRUE = 1
