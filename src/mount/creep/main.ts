import { creepExtensionBase } from './base';
import { creepExtensionResource } from './resource';
import { creepExtensionTransporter } from './transporter';


export const creepExtension = function () {
    creepExtensionBase();
    creepExtensionResource();
    creepExtensionTransporter();
}
