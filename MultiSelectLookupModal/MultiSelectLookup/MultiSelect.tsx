import { useEffect, useState, useMemo, useRef } from "react";
import MainDisplay from "./MainDisplay/MainDisplay";
import MultiSelectModal from "./Modal/MultiSelectModal";
import { IMultiSelect } from "./MultiSelect.types";
import { Selection,SelectionMode } from "@fluentui/react/lib/DetailsList";
import { maintainSelectedEntityData } from "./functions/apicalls";

const MultiSelect = (props: IMultiSelect) => {
  const {context, onChange} = props
  const [outputVariable, setOutputVariable] = useState<string|undefined>(context?.parameters.outputVariable.raw! || undefined);
  const [isModalOpen, setModalOpen] = useState(false);
  const [columnData, setColumnData] = useState<ComponentFramework.WebApi.Entity[]>([]);
  const [nextLink, setNextLink] = useState<string>();
  const [selectionArray, setSelectionArray] =
  useState<ComponentFramework.WebApi.Entity[]>();
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState(false);
  const [portalDataSet, setPortalDataSet] = useState<ComponentFramework.WebApi.Entity[]>();
  const [portalDataSize, setPortalDataSize] = useState<number>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pageSelected, setPageSelected] = useState<ComponentFramework.WebApi.Entity[]>();
  const entityName = context?.parameters.entityName.raw!;
  
  useEffect(()=> {
    onChange(outputVariable);
  },[outputVariable])

  const getIndexMatch= (item:ComponentFramework.WebApi.Entity, selected:ComponentFramework.WebApi.Entity) => 
  {
    return item[`${entityName}id`] === selected[`${entityName}id`]
  }
  // const usePrevious = <T extends unknown>(value: T): T | undefined => {
  //   const ref = useRef<T>();
  //   useEffect(() => {
  //     ref.current = value;
  //   },[value]);
  //   return ref.current;
  // };

  const updateSelectionArray = (entityName:string,current:ComponentFramework.WebApi.Entity[],prev?:ComponentFramework.WebApi.Entity[]) =>  {
    let pageSelect:ComponentFramework.WebApi.Entity[] | undefined;
    let curr = current;
    setPageSelected((pre)=> {
      pageSelect = pre;
      return current
    });
    let difference = pageSelect?.filter(x=> !current.includes(x))
    // console.log("current",curr.length);
    // console.log("difference",difference);
    // console.log("pre", pageSelect?.length)
    if(difference && difference.length === 1 && (pageSelect && pageSelect.length > current.length) ){
      const data = maintainSelectedEntityData(entityName, curr,prev);
      curr = data.filter(a => a[`${entityName}id`] !== difference![0][`${entityName}id`])
      return curr;
    }
    else{
      return maintainSelectedEntityData(entityName, curr,prev)
    }
    
  }
  const selection = useMemo(
    () =>
      new Selection({
        onSelectionChanged: () => {
          const array: ComponentFramework.WebApi.Entity[] = [];
          for (let i = 0; i < selection.count; i++) {
            array.push(
              selection.getSelection()[i] as ComponentFramework.WebApi.Entity[]
            );
          }
          
          
          setSelectionArray((prev)=> updateSelectionArray(entityName, array,prev));
        },
        selectionMode: SelectionMode.multiple,
      }),
    []
  );
  const handleOnLoad = async () => {
    if(window.location.href.includes("crm")){
      const output = context?.parameters.outputVariable.raw!;
      if(!output || (output && typeof output === "string" && output.length === 0) ){
        const page = context as any;
        if(page.page.entityId !== undefined)
        {
          const doubleCheck = await context?.webAPI.retrieveRecord(page.page.entityTypeName, page.page.entityId)
          const fieldId: string = page.reporting["_controlId"].split(".")[0];
          if(doubleCheck){
            const json = doubleCheck[fieldId];
            setOutputVariable(json);
          }
        }
      }
    }
  }
  useEffect(()=>{
    selectionArray?.forEach((item)=> {
      const index = columnData.findIndex((selItem) => getIndexMatch(item, selItem));
      if(index >= 0){
        setTimeout(()=>{
          selection.setIndexSelected(index,true,false);
        },150)
      }
    })
  },[columnData])
  useEffect(()=> {
    handleOnLoad();
    console.log("Updated 2022-12-01 11:21PM MST")
  },[])

  // useEffect(()=>{
  //   console.log("selectionArray", selectionArray)
  // },[selectionArray])
  if(context)
  {
    return (
      <>
        <MainDisplay 
          context={context}
          setModalOpen={setModalOpen} 
          columnData={columnData}
          setColumnData={setColumnData}
          setNextLink={setNextLink}
          outputVariable={outputVariable}
          selection={selection}
          setPageNumber={setPageNumber}
          setError={setError}
          setPortalDataSet={setPortalDataSet}
          setPortalDataSize={setPortalDataSize}
          setIsLoading={setIsLoading}
          setSelectionArray={setSelectionArray}
          />
        <MultiSelectModal 
          setOutputVariable={setOutputVariable}
          context={context}
          isModalOpen={isModalOpen}
          setModalOpen={setModalOpen}
          columnData={columnData}
          setColumnData={setColumnData}
          nextLink={nextLink}
          setNextLink={setNextLink}
          setSelectionArray={setSelectionArray}
          selectionArray={selectionArray}
          selection={selection}
          pageNumber={pageNumber}
          setPageNumber={setPageNumber}
          error={error}
          setError={setError}
          portalDataSet={portalDataSet}
          setPortalDataSet={setPortalDataSet}
          portalDataSize={portalDataSize}
          setPortalDataSize={setPortalDataSize}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      </>
    );
  }
  return (
  <div>
    An error has occured with the client API
  </div>
  );
};
export default MultiSelect;