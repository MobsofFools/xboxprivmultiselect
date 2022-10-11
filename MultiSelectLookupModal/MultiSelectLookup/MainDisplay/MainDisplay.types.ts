import { IInputs } from "../../generated/ManifestTypes";
import { Dispatch, SetStateAction } from "react"

export type IMainDisplay = {
    setModalOpen: Dispatch<SetStateAction<boolean>>;
    setColumnData: Dispatch<SetStateAction<ComponentFramework.WebApi.Entity[]>>;
    columnData: ComponentFramework.WebApi.Entity[]
    context: ComponentFramework.Context<IInputs>
    setNextLink: Dispatch<SetStateAction<string|undefined>>;
    outputVariable?: string;
    selection?:any;
    setPageNumber:Dispatch<SetStateAction<number>>;
}