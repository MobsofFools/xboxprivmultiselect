import { IInputs } from "../../generated/ManifestTypes";
import {Dispatch, SetStateAction} from 'react'

export type INewEntry = {
    context:ComponentFramework.Context<IInputs>
    setColumnData: Dispatch<SetStateAction<ComponentFramework.WebApi.Entity[]>>;
    setPanelOpen: Dispatch<SetStateAction<boolean>>;
    selection?:any;
    selectionArray?:ComponentFramework.WebApi.Entity[];
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
    IsValidForForm:boolean;
    ColumnNumber:number;
}

export type IMetadataResponse = {
    "@odata.context":string;
    value:ISimplifiedMetadata[];
}
export type IPickListMetadata = {
    "@odata.context":string;
    GlobalOptionSet:{
        MetadataId:string;
        Options: IOption[];
    }
    LogicalName:string;
    MetadataId:string;
}

type IOption =  {
    Color: string;
    Description: {
        LocalizedLabels?: [{Label:string;}]
        UserLocalizedLabel:{
            Label:string;
        }
    }
    Label :{
        LocalizedLabels?: [{Label:string;}]
        UserLocalizedLabel:{
            Label:string;
        }
    }
    Value:number;
}