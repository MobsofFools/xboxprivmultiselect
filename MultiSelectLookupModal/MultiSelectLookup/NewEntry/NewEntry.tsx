import { FormEvent, useEffect, useState } from "react";
import {
  IMetadataResponse,
  INewEntry,
  IPickListMetadata,
  ISimplifiedMetadata,
} from "./NewEntry.types";
import parse from "html-react-parser";
import { Spinner, SpinnerSize } from "@fluentui/react/lib/Spinner";
import { getEntityAfterCreate } from "../functions/apicalls";
import { mergeStyleSets } from "@fluentui/react/lib/Styling";

const NewEntry = (props: INewEntry) => {
  const { context, setColumnData, selection, selectionArray, setPanelOpen } =
    props;
  const [formData, setFormData] = useState<string[]>([]);
  const [formHTML, setFormHTML] = useState<any>();
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const FORM_ID = "modal-popup-new-entity-entry";
  const etn =
    context.parameters.entityName.raw![0].toLocaleUpperCase() +
    context.parameters.entityName.raw!.slice(1);

  const classNames = mergeStyleSets({
    form: {
      input: {
        width: "90%",
      },
      textarea: {
        border: "1px solid black",
        padding: "1px 2px",
        width: "90%",
      },
      select: {
        width: "90%",
        padding: "1px 2px",
      },
      option: {
        width: "90%",
        textWrap: "wrap",
      },
    },
  });
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const form = document.getElementById(FORM_ID) as HTMLFormElement;
    if (form) {
      const formData = new FormData(form);
      let uploadData = {} as any;
      formData.forEach((value, key) => {
        uploadData[key] = value;
      });
      console.log(uploadData);
      setIsCreating(true);
      const data = await context.webAPI.createRecord(
        context.parameters.entityName.raw!,
        uploadData
      );
      if (data) {
        const prevSelection = selectionArray;
        const newVal = await getEntityAfterCreate(context, data);
        console.log(newVal);
        setColumnData((prev) => [newVal, ...prev]);
        if (prevSelection) {
          selection.setRangeSelected(1, prevSelection.length, true, false);
        }
        form.reset();
        setPanelOpen(false);
        setIsCreating(false);
      }
    }
  };

  const getEntityMetaData = async () => {
    const any = context as any;
    const page = any.page;
    const crmURI = context.parameters.crmURI.raw! || page.getClientUrl();
    
    const data = (await (
      await fetch(
        crmURI +
          `/api/data/v9.2/EntityDefinitions(LogicalName='${context.parameters
            .entityName.raw!}')/Attributes`
      )
    ).json()) as IMetadataResponse;
    const metadataArray = data.value;
    const filteredArray = metadataArray.filter(
      (item) =>
        (item.IsRequiredForForm === true ||
          item.RequiredLevel.Value === "Recommended" ||
          item.RequiredLevel.Value === "ApplicationRequired") &&
        item.IsValidForForm === true
    ) as ISimplifiedMetadata[]; // || (item.RequiredLevel.Value !== "None" && item.IsPrimaryId === false)
    // filteredArray.forEach((item)=> {
    //     console.log(item.AttributeType,item.IsPrimaryId,item.LogicalName,item.RequiredLevel.Value, item.Description, item.DisplayName);
    // })
    const numberSortedArray = filteredArray.sort(
      (a, b) => a.ColumnNumber - b.ColumnNumber
    );
    return numberSortedArray;
  };
  const getPickListMetadata = async (id: string) => {
    const any = context as any;
    const page = any.page;
    const crmURI = context.parameters.crmURI.raw! || page.getClientUrl();
    const data = (await (
      await fetch(
        crmURI +
          `/api/data/v9.2/EntityDefinitions(LogicalName='${context.parameters
            .entityName
            .raw!}')/Attributes(LogicalName='${id}')/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?$select=LogicalName&$expand=GlobalOptionSet($select=Options)`
      )
    ).json()) as IPickListMetadata;
    const picklist = data.GlobalOptionSet.Options.map((item) => {
      return { Value: item.Value, Label: item.Label.UserLocalizedLabel.Label };
    });
    console.log(picklist);
    return picklist;
  };
  const createFormHTML = async () => {
    setIsLoading(true);
    const fieldMetadata = await getEntityMetaData();
    let htmlArray = await Promise.all(
      fieldMetadata.map(async (field) => {
        return await getFieldType(field);
      })
    );
    const array = htmlArray.filter((item) => item !== "");
    setFormData(array);
    setIsLoading(false);
  };
  const getFieldType = async (field: ISimplifiedMetadata) => {
    const TypeName = field.AttributeTypeName.Value;
    const FieldType = field.AttributeType;
    const requiredLevel = field.RequiredLevel.Value;
    // const Label = field.DisplayName.UserLocalizedLabel.Label || field.DisplayName.LocalizedLabels[0].Label ||  "";
    let string = "";
    console.log(TypeName, FieldType, requiredLevel, field.LogicalName);
    const getRequired = () => {
      if (
        requiredLevel === "SystemRequired" ||
        requiredLevel === "ApplicationRequired"
      ) {
        return true;
      }
      return false;
    };
    const required = getRequired();
    switch (field.AttributeType) {
      case "Boolean":
        string = `<div>BOOLEAN</div><br/>`;
        break;
      case "Customer":
        string = `<div>CUSTOMER</div><br/>`;
        break;
      case "DateTime":
        string = `
                <label htmlFor=${field.LogicalName}>${
          field.DisplayName.UserLocalizedLabel?.Label || field.LogicalName
        }</label><br/>
                <input type="datetime-local" name=${field.LogicalName} id=${
          field.LogicalName + "id"
        } required=${required}></input><br/>
                <br/>
                `;
        break;
      case "Decimal":
        string = `
                <label htmlFor=${field.LogicalName}>${
          field.DisplayName.UserLocalizedLabel?.Label || field.LogicalName
        }</label><br/>
                <input type="number" name=${field.LogicalName} id=${
          field.LogicalName + "id"
        } required=${required} step="any"></input><br/><br/>
                `;
        break;
      case "Double":
        string = `
            <label htmlFor=${field.LogicalName}>${
          field.DisplayName.UserLocalizedLabel?.Label || field.LogicalName
        }</label><br/>
            <input type="number" name=${field.LogicalName} id=${
          field.LogicalName + "id"
        } required=${required} step="any"></input><br/><br/>`;
        break;
      case "Integer":
        string = `
            <label htmlFor=${field.LogicalName}>${
          field.DisplayName.UserLocalizedLabel?.Label || field.LogicalName
        }</label><br/>
            <input type="number" name=${field.LogicalName} id=${
          field.LogicalName + "id"
        } required=${required} step="1"></input><br/><br/>
        `;
        break;
      case "Lookup":
        string = `
            <div>Lookup</div>
        `;
        break;
      case "Memo":
        string = `
            <label htmlFor=${field.LogicalName}>${
          field.DisplayName.UserLocalizedLabel?.Label || field.LogicalName
        }</label><br/>
            <textarea id=${field.LogicalName + "id"} name=${
          field.LogicalName
        } required={${required}}></textarea>
            <br/><br/>
            `;
        break;
      case "Money":
        string = `
                <label htmlFor=${field.LogicalName}>${
          field.DisplayName.UserLocalizedLabel?.Label || field.LogicalName
        }</label><br/>
                <input type="number" name=${field.LogicalName} id=${
          field.LogicalName + "id"
        } required=${required} step="any"></input>
                <br/><br/>
            `;
        break;
      case "Owner":
        break;
      case "PartyList":
        break;
      case "Picklist":
        const data = await getPickListMetadata(field.LogicalName);
        const optionArray = data.map((item) => {
          return `<option value="${item.Value}">${item.Label}</option>`;
        });
        const optionstring = optionArray.join("");
        string =
          `<label htmlFor=${field.LogicalName}>${
            field.DisplayName.UserLocalizedLabel?.Label || field.LogicalName
          }
            </label><br/>
            <select name=${field.LogicalName} id=${field.LogicalName + "id"} >
              <option disabled selected value></option>
            ` +
          optionstring +
          `

        </select>
        <br/>
        `;
        break;
      case "State":
        break;
      case "Status":
        break;
      case "String":
        string = `
                <label htmlFor=${field.LogicalName}>${
          field.DisplayName.UserLocalizedLabel?.Label || field.LogicalName
        }</label><br/>
                <input type="text" name=${field.LogicalName} id=${
          field.LogicalName + "id"
        } required=${required}></input>
                <br/><br/>
            `;
        break;
      case "UniqueIdentifier":
        break;
      case "CalendarRules":
        break;
      case "Virtual":
        break;
      case "BigInt":
        string = `
                <label htmlFor=${field.LogicalName}>${
          field.DisplayName.UserLocalizedLabel?.Label || field.LogicalName
        }</label><br/>
                <input type="number" name=${field.LogicalName} id=${
          field.LogicalName + "id"
        } required=${required} step="1"></input>
                <br/><br/>
            `;
        break;
      case "ManagedProperty":
        break;
      case "EntityName":
        break;
      default:
        break;
    }
    return string;
  };
  useEffect(() => {
    createFormHTML();
  }, []);
  useEffect(() => {
    const string = formData.join("");
    setFormHTML(string);
  }, [formData]);

  return (
    <div className={classNames.form}>
      <h2>Create New {etn}</h2>
      <br />
      {isLoading === true ? (
        <div>
          <div>LOADING</div>
          <Spinner size={SpinnerSize.large} />
        </div>
      ) : (
        <form onSubmit={onSubmit} id={FORM_ID}>
          {formHTML ? parse(formHTML) : null}
          <input type={"submit"} value="Submit"></input>
        </form>
      )}
      {isCreating === true ? (
        <div>
          <Spinner size={SpinnerSize.large} />
        </div>
      ) : null}
    </div>
  );
};

export default NewEntry;
