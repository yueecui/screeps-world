import { creepExtensionProperty } from './property';
import { creepExtensionUtil } from './util';
import { creepExtensionResource } from './resource';
import { creepExtensionTransporter } from './transporter';
import { creepExtensionHarvester } from './work';
import { creepExtensionAttacker } from './attack';


export const creepExtension = function () {
    creepExtensionProperty();
    creepExtensionUtil();
    creepExtensionResource();
    creepExtensionTransporter();
    creepExtensionHarvester();
    creepExtensionAttacker();
}
