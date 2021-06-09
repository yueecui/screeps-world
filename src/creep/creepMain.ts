import { creepExtensionProperty } from './creepProperty';
import { creepExtensionUtil } from './creepUtil';
import { creepExtensionResource } from './creepResource';
import { creepExtensionTransporter } from './creepTransporter';
import { creepExtensionHarvester } from './creepWork';
import { creepExtensionAttacker } from './creepAttack';


export const creepExtension = function () {
    creepExtensionProperty();
    creepExtensionUtil();
    creepExtensionResource();
    creepExtensionTransporter();
    creepExtensionHarvester();
    creepExtensionAttacker();
}
