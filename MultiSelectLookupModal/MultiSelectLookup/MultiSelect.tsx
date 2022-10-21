import { useEffect, useState, useMemo } from "react";
import MainDisplay from "./MainDisplay/MainDisplay";
import MultiSelectModal from "./Modal/MultiSelectModal";
import { IMultiSelect } from "./MultiSelect.types";
import { Selection,SelectionMode } from "@fluentui/react/lib/DetailsList";


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
          setSelectionArray(array);
        },
        selectionMode: SelectionMode.multiple,
      }),
    []
  );
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