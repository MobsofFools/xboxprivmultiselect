import { IColumn } from "@fluentui/react";
import { IInputs } from "../../generated/ManifestTypes";
import { ORDER_BY } from "../constants";
import { RetrieveMultipleRecordsPortalResponse } from "../MainDisplay/MainDisplay.types";

const getFetchXML = (page: number, entityName: string, selectedColumns: string, pageLength: number, search?: string, orderby?: string, sortAsc?: string, isSortedDescending?: string, oDataFilter?: string) => {
  let desc;
  if (isSortedDescending) {
    desc = isSortedDescending;
  }
  else if (sortAsc) {
    if (sortAsc === "desc") {
      desc = "true";
    }
    else {
      desc = "false";
    }
  }
  else {
    desc = "true"
  }

  const order = orderby || ORDER_BY
  let xml = `<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="false" count="${pageLength}" page="${page}">`;
  xml += `<entity name="${entityName}">`
  const columnArray = selectedColumns.split(",");
  columnArray.forEach((column) => {
    xml += `<attribute name="${column}" />`
  })
  xml += `<order attribute="${order}" descending="${desc}"/>`
  if (search && search.length > 0) {
    if (columnArray.length > 1) {
      xml += `<filter type="and"><filter type="or">`
      columnArray.forEach((column) => {
        xml += `<condition attribute="${column}" operator="like" value="%${search}%"/>`
      });
      xml += `</filter></filter>`
    }
    else {
      xml += `<filter type="and">`
      xml += `<condition attribute="${columnArray[0]}" operator="like" value="%${search}%"/>`
      xml += `</filter>`
    }
  }
  if (oDataFilter) {
    const split = oDataFilter.split(" ");
    const attr = split[0];
    const oper = split[1];
    const filterval = split[3];
    xml += `<filter type="and">`
    xml += `<condition attribute="${attr}" operator="${oper}" value="${filterval}"/>`
    xml += `</filter>`
  }
  xml += `</entity></fetch>`
  return xml;
}
const getSortedColumn = (columns: IColumn[]) => {
  const sortedCol = columns.filter((col) => col.isSorted === true);
  return sortedCol[0];

}

export const getSearchPage = async (context: ComponentFramework.Context<IInputs>, page: number, columns: IColumn[], search?: string) => {
  const entityName = context.parameters.entityName.raw!;
  const selectedColumns = context.parameters.selectedColumns.raw!;
  const sortAsc = context.parameters.sortAsc.raw! === "" || undefined ? "desc" : "asc";
  const oDataFilter = context.parameters.oDataFilter.raw!;
  const pageLength = 50;
  const sorted = getSortedColumn(columns);
  const xml = "?fetchXml=" + getFetchXML(page, entityName, selectedColumns, pageLength, search, sorted?.fieldName, sortAsc, sorted?.isSortedDescending?.toString(), oDataFilter);
  const data = await context.webAPI.retrieveMultipleRecords(
    entityName,
    xml
  )
  return data;
}
export const getEntityFilterResults = async (context: ComponentFramework.Context<IInputs>, orderby: string, isSortedDescending?: boolean, query?: string) => {
  const entityName = context.parameters.entityName.raw!;
  const selectedColumns = context.parameters.selectedColumns.raw!;
  const oDataFilter = context.parameters.oDataFilter.raw!;
  const pageLength = 50;
  let queryString = `?$select=${selectedColumns}`;
  const columnArray = selectedColumns.split(",");
  const desc = isSortedDescending ? "desc" : "asc";
  const orderBy = `&$orderby=${orderby} ${desc}`
  let searchString = `&$filter=`
  let filterString = ``;
  columnArray.forEach((column, i) => {
    if (i === 0) {
      const concat = `contains(${column},'${query}')`
      filterString += concat;
    }
    else {
      const concat = ` or contains(${column},'${query}')`
      filterString += concat;
    }
  })
  if (typeof oDataFilter === "string" && oDataFilter !== "") {
    searchString += `${oDataFilter}`
    if (typeof query === "string" && query !== "") {
      if (columnArray.length === 1) {
        searchString += ` and ${filterString}`;
      }
      else {
        searchString += ` and (${filterString})`;
      }
    }
  }
  else {

    searchString += filterString;
  }
  if (searchString !== `$&filter=` && searchString.length !== 10) {
    queryString += searchString;
  }
  // console.log("filter: ", filterString)
  // console.log("search string:" , searchString)
  // console.log("orderby: ", orderBy);
  // console.log("query string: ", queryString + orderBy);

  const data = await context.webAPI.retrieveMultipleRecords(
    entityName,
    queryString + orderBy,
    pageLength
  )
  return data;
}
export const getPortalFilterResults = async (context: ComponentFramework.Context<IInputs>, orderby: string, isSortedDescending?: boolean, query?: string) => {
  // console.log("Calling Portal Filter API Call")
  const entityName = context.parameters.entityName.raw!;
  const selectedColumns = context.parameters.selectedColumns.raw!;
  const oDataFilter = context.parameters.oDataFilter.raw!;
  let queryString = `?$select=${selectedColumns}`;
  const columnArray = selectedColumns.split(",");
  const desc = isSortedDescending ? "desc" : "asc";
  const orderBy = `&$orderby=${orderby} ${desc}`
  let searchString = `&$filter=`
  let filterString = ``;
  columnArray.forEach((column, i) => {
    if (i === 0) {
      const concat = `contains(${column},'${query}')`
      filterString += concat;
    }
    else {
      const concat = ` or contains(${column},'${query}')`
      filterString += concat;
    }
  })

  if (typeof oDataFilter === "string" && oDataFilter !== "") {
    searchString += `${oDataFilter}`
    if (typeof query === "string" && query !== "") {
      if (columnArray.length === 1) {
        searchString += ` and ${filterString}`;
      }
      else {
        searchString += ` and (${filterString})`;
      }
    }
  }
  else {
    searchString += filterString;
  }
  if (searchString !== `$&filter=` && searchString.length !== 10) {
    queryString += searchString;
  }
  // console.log("filter: ", filterString)
  // console.log("search string:" , searchString)
  // console.log("orderby: ", orderBy);
  // console.log("query string: ", queryString + orderBy);
  const href = window.location.origin;
  const portalUrl = href + "/_api/"
  const fetchurl = portalUrl + entityName + "s" + queryString + orderBy + `&$count=true`
  // console.log("url:", fetchurl)
  const data = await (await fetch(fetchurl)).json() as RetrieveMultipleRecordsPortalResponse;
  // console.log("Portal Api Data", data)
  return data;
}
export const getEntitySearchResults = async (context: ComponentFramework.Context<IInputs>, query: string) => {
  const orderby = context.parameters.orderBy.raw! || ORDER_BY;
  const desc = context.parameters.sortAsc.raw! === "" || undefined ? "desc" : "asc";
  const oDataFilter = context.parameters.oDataFilter.raw!;
  const entityName = context.parameters.entityName.raw!;
  const selectedColumns = context.parameters.selectedColumns.raw!;
  const pageLength = 50;
  const queryString = `?$select=${selectedColumns}`
  const columnArray = selectedColumns.split(",");
  let searchString = `&$filter=`
  let filterString = ``;
  columnArray.forEach((column, i) => {
    if (i === 0) {
      const concat = `contains(${column},'${query}')`
      filterString += concat;
    }
    else {
      const concat = ` or contains(${column},'${query}')`
      filterString += concat;
    }
  })
  if (oDataFilter) {
    if (query) {
      searchString += `${oDataFilter} and (${filterString})`;
    }
    else {
      searchString += oDataFilter;
    }
  }
  else {
    searchString += filterString;
  }
  const data = await context.webAPI.retrieveMultipleRecords(
    entityName,
    queryString + searchString + `&$orderby=${orderby} ${desc}`,
    pageLength
  )
  return data;
}

export const getEntityInitialResults = async (context: ComponentFramework.Context<IInputs>) => {
  const orderby = context.parameters.orderBy.raw! || ORDER_BY;
  const desc = context.parameters.sortAsc.raw! === "false" ? "desc" : "asc";
  const oDataFilter = context.parameters.oDataFilter.raw!;
  let entityName = context.parameters.entityName.raw!
  const sortQuery = `&$orderby=${orderby} ${desc}`
  const selectedColumns = context.parameters.selectedColumns.raw!
  const pageLength = 50;
  let filterString = ``;
  if (oDataFilter) {
    filterString += `&$filter=${oDataFilter}`
  }
  let queryString = `?$select=${selectedColumns}` + sortQuery + filterString;
  const data = await context.webAPI.retrieveMultipleRecords(
    entityName,
    queryString,
    pageLength
  );
  return data;
};
//Unused
export const getEntityAfterCreate = async (context: ComponentFramework.Context<IInputs>, newLookup: ComponentFramework.LookupValue) => {
  const entityName = context.parameters.entityName.raw!
  const selectedColumns = context.parameters.selectedColumns.raw!
  const queryString = `?$select=${selectedColumns}`;
  const data = await context.webAPI.retrieveRecord(entityName, newLookup.id, queryString);
  return data;
}
export const maintainSelectedEntityData = (entityname: string, data: ComponentFramework.WebApi.Entity[], selectionArray?: ComponentFramework.WebApi.Entity[]) => {
  if (selectionArray) {
    let dataArray: ComponentFramework.WebApi.Entity[] = selectionArray.concat(data);
    let uniqueObjArray = [
      ...new Map(dataArray.map((item) => [item[`${entityname}id`], item])).values(),
    ];
    return uniqueObjArray;
  }
  else {
    return data;
  }
}
export const getPortalInitialResults = async (context: ComponentFramework.Context<IInputs>) => {
  const orderby = context.parameters.orderBy.raw! || ORDER_BY;
  const desc = context.parameters.sortAsc.raw! === "false" ? "desc" : "asc";
  const oDataFilter = context.parameters.oDataFilter.raw!;
  let entityName = context.parameters.entityName.raw!
  const sortQuery = `&$orderby=${orderby} ${desc}`
  const selectedColumns = context.parameters.selectedColumns.raw!;
  let queryString = `?$select=${selectedColumns}` + sortQuery + `&$count=true`
  let filterString = ``;
  if (oDataFilter) {
    filterString += `&$filter=${oDataFilter}`
  }
  const href = window.location.origin;
  const portalUrl = href + "/_api/"
  const fetchurl = portalUrl + entityName + "s" + queryString + filterString;
  const data = await (await fetch(fetchurl)).json();
  return data;
}
export const getPortalSearchResults = async (context: ComponentFramework.Context<IInputs>, query: string) => {
  const orderby = context.parameters.orderBy.raw! || ORDER_BY;
  const oDataFilter = context.parameters.oDataFilter.raw!;
  const desc = context.parameters.sortAsc.raw! === "false" ? "desc" : "asc";
  const entityName = context.parameters.entityName.raw!
  const selectedColumns = context.parameters.selectedColumns.raw!
  const queryString = `?$select=${selectedColumns}`
  const columnArray = selectedColumns.split(",");
  let filterString = `&$filter=`;
  let searchString = ``;

  columnArray.forEach((column, i) => {
    if (i === 0) {
      const concat = `contains(${column},'${query}')`
      searchString += concat;
    }
    else {
      const concat = ` or contains(${column},'${query}')`
      searchString += concat;
    }
  })
  if (oDataFilter) {
    filterString += `${oDataFilter} `
    filterString += `and ( ${searchString} )`
  }
  else {
    filterString += searchString;
  }
  const href = window.location.origin;
  const portalUrl = href + "/_api/"
  const fetchurl = portalUrl + entityName + "s" + queryString + filterString + `&$orderby=${orderby} ${desc}&$count=true`
  const data = await (await fetch(fetchurl)).json() as RetrieveMultipleRecordsPortalResponse;
  return data
}