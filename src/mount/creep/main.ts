import { creepExtensionBase } from './base';
import { creepExtensionResource } from './resource';
import { creepExtensionTransporter } from './transporter';
import { creepExtensionHarvester } from './work';
import { creepExtensionAttacker } from './attack';


export const creepExtension = function () {
    creepExtensionBase();
    creepExtensionResource();
    creepExtensionTransporter();
    creepExtensionHarvester();
    creepExtensionAttacker();
}
