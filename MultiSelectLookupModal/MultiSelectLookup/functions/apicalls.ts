import { IInputs } from "../../generated/ManifestTypes";

const getFetchXML = (page:number, entityName:string, selectedColumns:string, pageLength:number, search?:string) => {
    let xml = `<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false" count="${pageLength}" page="${page}">`;
    xml += `<entity name="${entityName}">`
    const columnArray = selectedColumns.split(",");
    columnArray.forEach((column)=> {
      xml += `<attribute name="${column}" />`
    })
    xml +=`<order attribute="createdon" descending="true"/>`
    if(search && search.length>0)
    {
      if(columnArray.length>1)
      {
        xml+= `<filter type="and"><filter type="or">`
        columnArray.forEach((column)=> {
          xml+=`<condition attribute="${column}" operator="like" value="%${search}%"/>`
        });
        xml+= `</filter></filter>`
      }
      else{
        xml+= `<filter type="and">`
        xml+=`<condition attribute="${columnArray[0]}" operator="like" value="%${search}%"/>`
        xml+= `</filter>`
      }
    }
    xml += `</entity></fetch>`
    return xml;
  }

  export const getSearchPage = async(context:ComponentFramework.Context<IInputs> , page:number, search?:string) => {
    const entityName = context.parameters.entityName.raw!
    const selectedColumns = context.parameters.selectedColumns.raw!
    const pageLength = parseInt(context.parameters.pageLength.raw!) || 50;
    const xml = "?fetchXml="+getFetchXML(page,entityName,selectedColumns,pageLength,search);
    const data = await context.webAPI.retrieveMultipleRecords(
      entityName,
      xml
    )
    return data;
  }

  export const getEntitySearchResults = async(context:ComponentFramework.Context<IInputs>, query:string) => {
    const entityName = context.parameters.entityName.raw!
    const selectedColumns = context.parameters.selectedColumns.raw!
    const pageLength = parseInt(context.parameters.pageLength.raw!) || 50;
    const queryString = `?$select=${selectedColumns}`
    const columnArray = selectedColumns.split(",");
    let searchString = `&$filter=`
    columnArray.forEach((column,i)=> {
     if(i=== 0) 
     {
      const concat = `contains(${column},'${query}')`
      searchString += concat;
     }
     else {
      const concat = ` or contains(${column},'${query}')`
      searchString += concat;
     }
    })
    const data = await context.webAPI. retrieveMultipleRecords(
      entityName,
      queryString+searchString+"&$orderby=createdon desc",
      pageLength
    )
    return data;
  }

  export const getEntityInitialResults = async (context:ComponentFramework.Context<IInputs>) => {
    let entityName = context.parameters.entityName.raw!
    // TEMP FIX?
    if(window.location.href.includes("portal")) 
    {
      entityName = context.parameters.entityName.raw! + "s"
    }
    const selectedColumns = context.parameters.selectedColumns.raw!
    const pageLength = parseInt(context.parameters.pageLength.raw!) || 50;
    const queryString = `?$select=${selectedColumns}&$orderby=createdon desc`
    const data = await context.webAPI.retrieveMultipleRecords(
      entityName,
      queryString,
      pageLength
    );
      return data;
  };
export const getEntityAfterCreate = async (context:ComponentFramework.Context<IInputs>, newLookup: ComponentFramework.LookupValue) => {
    const entityName = context.parameters.entityName.raw!
    const selectedColumns = context.parameters.selectedColumns.raw!
    const queryString = `?$select=${selectedColumns}`;
    const data = await context.webAPI.retrieveRecord(entityName, newLookup.id, queryString);
    return data;
}
  export const maintainSelectedEntityData = (data:ComponentFramework.WebApi.Entity[], selectionArray?:ComponentFramework.WebApi.Entity[]) => {
    if(selectionArray)
    {
      let dataArray:ComponentFramework.WebApi.Entity[] = selectionArray.concat(data);
      let uniqueObjArray = [
        ...new Map(dataArray.map((item) => [item["@odata.etag"], item])).values(),
    ];
      return uniqueObjArray;
    }
    else{
      return data;
    }
  }