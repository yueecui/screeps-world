import { creepExtensionBase } from './base';
import { creepExtensionResource } from './resource';
import { creepExtensionTransporter } from './transporter';
import { creepExtensionHarvester } from './work';


export const creepExtension = function () {
    creepExtensionBase();
    creepExtensionResource();
    creepExtensionTransporter();
    creepExtensionHarvester();
}
