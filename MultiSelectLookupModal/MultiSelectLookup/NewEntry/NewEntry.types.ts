import { IInputs } from "../../generated/ManifestTypes";
import {Dispatch, SetStateAction} from 'react'

export type INewEntry = {
    context:ComponentFramework.Context<IInputs>
    setColumnData: Dispatch<SetStateAction<ComponentFramework.WebApi.Entity[]>>;
    columnData: ComponentFramework.WebApi.Entity[];
    setPanelOpen: Dispatch<SetStateAction<boolean>>;
}
export type ISimplifiedMetadata = {
    LogicalName:string;
    RequiredLevel: {
        Value: string
    }
    AttributeType: string;
    AttributeTypeName: {
        Value: string;
    }
    IsPrimaryId: boolean;
    DisplayName: {
        LocalizedLabels: [{
            Label:string;
        }];
        UserLocalizedLabel:{
            Label:string;
        }
    }
    Description:{
        LocalizedLabels: [{
            Label:string;
        }];
        UserLocalizedLabel:{
            Label:string;
        }
    }
    IsRequiredForForm: boolean;
}

export type IMetadataResponse = {
    "@odata.context":string;
    value:ISimplifiedMetadata[];
}