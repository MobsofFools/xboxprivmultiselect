import { Dispatch, SetStateAction } from "react"
import { IInputs } from "../../generated/ManifestTypes";

export type IMultiSelectModal = {
    isModalOpen:boolean;
    setModalOpen: Dispatch<SetStateAction<boolean>>;
    context: ComponentFramework.Context<IInputs>;
    columnData:ComponentFramework.WebApi.Entity[];
    setColumnData: Dispatch<SetStateAction<ComponentFramework.WebApi.Entity[]>>;
    nextLink?: string;
    setNextLink: Dispatch<SetStateAction<string|undefined>>;
    setOutputVariable: Dispatch<SetStateAction<string|undefined>>;
    selectionArray: ComponentFramework.WebApi.Entity[]|undefined;
    setSelectionArray: Dispatch<SetStateAction<ComponentFramework.WebApi.Entity[]|undefined>>;
    selection?:any;
    setPageNumber:Dispatch<SetStateAction<number>>;
    pageNumber:number;

}