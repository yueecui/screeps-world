export default function (){
    const _isActive = Structure.prototype.isActive;
    Structure.prototype.isActive = function() {
        if (this.structureType === STRUCTURE_CONTAINER || this.structureType === STRUCTURE_ROAD) {
            // Always true for these
            this.isActive = function() { return true };
            return true;
        }
        if (this.room.controller?.level == 8){
            this.isActive = function() { return true };
            return true;
        }
        const curActive = _isActive.call(this);
        this.isActive = function() { return curActive };
        return curActive;
    };
}
