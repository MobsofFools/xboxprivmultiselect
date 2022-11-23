import { useEffect, useState, useMemo } from "react";
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
  const [prevSelectionArray, setPrevSelectionArray] = useState<ComponentFramework.WebApi.Entity[]>()

  const maintainSelectionData = (arr:any[], arr2:any[]) => {
    if(arr.length - arr2.length > 0){
     //increase 
    }
    else{
      //decrease
    }
  }
  useEffect(()=> {
    onChange(outputVariable);
  },[outputVariable])
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
          console.log(selection.getSelectedIndices());
          setPrevSelectionArray(array)
          setSelectionArray((prev)=> maintainSelectedEntityData(array,prev));
          console.log(selection)
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

  // useEffect(()=> {
  //   console.log("prev",prevSelectionArray);
  //   console.log("curr",selectionArray);

  // },[prevSelectionArray,selectionArray])
  useEffect(()=> {
    handleOnLoad();
  },[])
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