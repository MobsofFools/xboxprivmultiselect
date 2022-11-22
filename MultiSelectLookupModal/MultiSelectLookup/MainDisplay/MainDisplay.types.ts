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
    setError:Dispatch<SetStateAction<boolean>>;
    setPortalDataSet: Dispatch<SetStateAction<ComponentFramework.WebApi.Entity[]|undefined>>;
    setPortalDataSize : Dispatch<SetStateAction<number|undefined>>;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
    setSelectionArray:Dispatch<SetStateAction<ComponentFramework.WebApi.Entity[]|undefined>>;
}
export type RetrieveMultipleRecordsPortalResponse = {
    value: ComponentFramework.WebApi.Entity[],
    "@odata.count":number
}