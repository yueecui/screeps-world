import creepExtensionProperty from './creepProperty';
import creepExtensionUtil from './creepBase';
import creepExtensionResource from './creepResource';
import creepExtensionTransporter from './creepTransporter';
import creepExtensionHarvester from './creepWork';
import creepExtensionAttacker from './creepAttack';


export default function () {
    creepExtensionProperty();
    creepExtensionUtil();
    creepExtensionResource();
    creepExtensionTransporter();
    creepExtensionHarvester();
    creepExtensionAttacker();
}
