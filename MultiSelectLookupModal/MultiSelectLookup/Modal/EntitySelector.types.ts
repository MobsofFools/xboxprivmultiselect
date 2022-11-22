export type IEntitySelector = {
    entity: ComponentFramework.WebApi.Entity;
    title:string;
    removeTag: (etn: ComponentFramework.WebApi.Entity) => void;
}