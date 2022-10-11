import { Dispatch, SetStateAction } from "react";
import { IInputs } from "../../generated/ManifestTypes";

export type INavigation = {
    pageNumber: number;
    setPageNumber: Dispatch<SetStateAction<number>>;
    setColumnData: Dispatch<SetStateAction<ComponentFramework.WebApi.Entity[]>>;
    nextLink?:string;
    search?:string;
    context: ComponentFramework.Context<IInputs>
    fetchXMLPagingCookie?:string;
    getRequestedPage: (page:number)=> void;
    windowDimensions: {width:number,height:number}

}