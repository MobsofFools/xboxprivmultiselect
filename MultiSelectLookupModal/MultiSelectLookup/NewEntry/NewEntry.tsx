import { FormEvent, useEffect, useState } from "react";
import {
  IMetadataResponse,
  INewEntry,
  ISimplifiedMetadata,
} from "./NewEntry.types";
import parse from "html-react-parser";
import { Spinner, SpinnerSize } from "@fluentui/react/lib/Spinner";
import { getEntityAfterCreate } from "../functions/apicalls";

const NewEntry = (props: INewEntry) => {
  const { context, columnData, setColumnData } = props;
  const [formData, setFormData] = useState<string[]>([]);
  const [formHTML, setFormHTML] = useState<any>();
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const FORM_ID = "modal-popup-new-entity-entry";
  const etn =
    context.parameters.entityName.raw![0].toLocaleUpperCase() +
    context.parameters.entityName.raw!.slice(1);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const form = document.getElementById(FORM_ID);
    if (form) {
      const formData = new FormData(form as HTMLFormElement);
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
       const newVal = await getEntityAfterCreate(context,data);
       setColumnData((prev)=> [newVal,...prev]);
       setIsCreating(false);
      }
    }
  };

  const getEntityMetaData = async () => {
    const any = context as any;
    const page = any.page;
    const data = (await (
      await fetch(
        page.getClientUrl() +
          `/api/data/v9.2/EntityDefinitions(LogicalName='${context.parameters
            .entityName.raw!}')/Attributes`
      )
    ).json()) as IMetadataResponse;
    const metadataArray = data.value;
    const filteredArray = metadataArray.filter(
      (item) =>
        item.IsRequiredForForm === true ||
        item.RequiredLevel.Value === "Recommended"
    ) as ISimplifiedMetadata[]; // || (item.RequiredLevel.Value !== "None" && item.IsPrimaryId === false)
    // filteredArray.forEach((item)=> {
    //     console.log(item.AttributeType,item.IsPrimaryId,item.LogicalName,item.RequiredLevel.Value, item.Description, item.DisplayName);
    // })
    return filteredArray;
  };
  const getPickListMetadata = async () => {};
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
                <input type={"datetime-local"} name=${field.LogicalName} id={${
          field.LogicalName
        }+"id"} required={true}></input><br/>
                <br/>
                `;
        break;
      case "Decimal":
        string = `
                <label htmlFor=${field.LogicalName}>${
          field.DisplayName.UserLocalizedLabel?.Label || field.LogicalName
        }</label><br/>
                <input type={"number"} name=${field.LogicalName} id={${
          field.LogicalName
        }+"id"} required={true} step="any"></input><br/><br/>
                `;
        break;
      case "Double":
        string = `
            <label htmlFor=${field.LogicalName}>${
          field.DisplayName.UserLocalizedLabel?.Label || field.LogicalName
        }</label><br/>
            <input type={"number"} name=${
              field.LogicalName
            } id={field.LogicalName+"id"} required={true} step="any"></input><br/><br/>`;
        break;
      case "Integer":
        string = `
            <label htmlFor=${field.LogicalName}>${
          field.DisplayName.UserLocalizedLabel?.Label || field.LogicalName
        }</label><br/>
            <input type={"number"} name=${field.LogicalName} id={${
          field.LogicalName
        }+"id"} required={true} step="1"></input><br/><br/>
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
            <textarea id={${field.LogicalName}+"id"} name=${
          field.LogicalName
        } required={true}></textarea>
            <br/><br/>
            `;
        break;
      case "Money":
        string = `
                <label htmlFor=${field.LogicalName}>${
          field.DisplayName.UserLocalizedLabel?.Label || field.LogicalName
        }</label><br/>
                <input type={"number"} name=${field.LogicalName} id={${
          field.LogicalName
        }+"id"} required={true} step="any"></input>
                <br/><br/>
            `;
        break;
      case "Owner":
        break;
      case "PartyList":
        break;
      case "Picklist":
        const data = await getPickListMetadata();
        string = `<div>PICKLIST</div>`;
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
                <input type={"text"} name=${field.LogicalName} id={${
          field.LogicalName
        }+"id"} required={true}></input>
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
                <input type={"number"} name=${field.LogicalName} id={${
          field.LogicalName
        }+"id"} required={true} step="1"></input>
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
    <div>
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
          <br />
          <input type={"submit"} value="Submit"></input>
        </form>     
      )}
      {isCreating === true? 
        (<div>
            <Spinner size={SpinnerSize.large} />
        </div>) : null
        }
    </div>
  );
};

export default NewEntry;
