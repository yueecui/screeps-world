import creepExtensionProperty from './creepProperty';
import creepExtensionBase from './creepBase';
import creepExtensionResource from './creepResource';
import creepExtensionTransporter from './creepCarrier';
import creepExtensionHarvester from './creepWork';
import creepExtensionAttacker from './creepAttack';


export default function () {
    creepExtensionProperty();
    creepExtensionBase();
    creepExtensionResource();
    creepExtensionTransporter();
    creepExtensionHarvester();
    creepExtensionAttacker();
}
