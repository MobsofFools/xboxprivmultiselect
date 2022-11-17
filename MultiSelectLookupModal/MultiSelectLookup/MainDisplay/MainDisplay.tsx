import { IconButton } from "@fluentui/react/lib/Button";
import { IIconProps } from "@fluentui/react/lib/Icon";
import {
  IMainDisplay,
  RetrieveMultipleRecordsPortalResponse,
} from "./MainDisplay.types";
import {
  getEntityInitialResults,
  getPortalInitialResults,
  maintainSelectedEntityData,
} from "../functions/apicalls";
import { BUTTON_COLOR, ICON_COLOR } from "../constants";
import { mergeStyleSets, TooltipHost } from "@fluentui/react";
import { useEffect } from "react";
const MainDisplay = (props: IMainDisplay) => {
  const {
    setModalOpen,
    setColumnData,
    context,
    setNextLink,
    outputVariable,
    selection,
    setPageNumber,
    setError,
    setPortalDataSet,
    setPortalDataSize,
  } = props;

  const entityName = context.parameters.entityName.raw!;
  const displayProperty = context.parameters.displayedColumn.raw!;
  const buttonColor = context.parameters.buttonColor.raw! || BUTTON_COLOR;
  const iconColor = context.parameters.iconColor.raw! || ICON_COLOR;
  const onButtonClick = async () => {
    setModalOpen(true);
    if (window.location.href.includes("portal")) {
      const data = (await getPortalInitialResults(
        context
      )) as RetrieveMultipleRecordsPortalResponse;
      if (data) {
        setPortalDataSet(data.value);
        setPortalDataSize(data["@odata.count"]);
        const slicedData = data.value.slice(0, 50);
        if (typeof outputVariable === "string" && outputVariable.length > 0) {
          if (isJsonString(outputVariable)) {
            const json = JSON.parse(
              outputVariable
            ) as ComponentFramework.WebApi.Entity[];
            const merge = maintainSelectedEntityData(slicedData, json);

            setColumnData(merge);
            selection.setRangeSelected(0, json.length, true, false);
          } else {
            setColumnData(slicedData);
          }
        } else {
          setColumnData(slicedData);
        }
        setPageNumber(1);
      }
    } else {
      const data = await getEntityInitialResults(context).catch((error) =>
        setError(true)
      );
      if (data) {
        if (typeof outputVariable === "string" && outputVariable.length > 0) {
          if (isJsonString(outputVariable)) {
            const json = JSON.parse(
              outputVariable
            ) as ComponentFramework.WebApi.Entity[];
            const merge = maintainSelectedEntityData(data.entities, json);
            setColumnData(merge);
            setPageNumber(1);
            selection.setRangeSelected(0, json.length, true, false);
          }
        } else {
          setColumnData(data.entities);
        }
        setNextLink(data.nextLink);
      }
    }
  };
  function isJsonString(str: string) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  const SearchIcon: IIconProps = { iconName: "Search" };

  const getDisplayArray = () => {
    const array: string[] = [];
    if (outputVariable && isJsonString(outputVariable)) {
      const json = JSON.parse(outputVariable);
      json.forEach((item: any) => {
        array.push(item[displayProperty]);
      });
    }
    return array;
  };
  const display = getDisplayArray();
  const numberOfItems = display.length - 1;

  const classNames = mergeStyleSets({
    portalDisplay: {
      width: "100%",
    },
    crmDisplay: {
      width: "98%",
    },
  });

  const getPortalOrCRMClass = () => {
    if (window.location.href.includes("portal")) {
      return classNames.portalDisplay;
    } else {
      return classNames.crmDisplay;
    }
  };
  const divClass = getPortalOrCRMClass();
  useEffect(() => {
    const load = getDisplayArray();
    if (load) {
      sessionStorage.setItem(`${entityName}selectedItems`, load.toString());
      window.dispatchEvent(new Event("storage"));
    }
  }, []);
  const getPortalRecordStatus = () => {
    if (window.location.href.includes("portal")) {
      const span:HTMLSpanElement|null = document.getElementById("statuscode");
      if(span){
        const text = span.innerHTML;
        if(text === "Closed")
        {
          return true;
        }
      }
    }
    return false;
  }
  const portalRecordStatus = getPortalRecordStatus();

  return (
    <div
      className={divClass}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div
        style={{
          border: "1px solid #CCCCCC",
          background: "#F9F9F9",
          display: "flex",
          height: "35px",
          justifyContent: "space-between",
          flexGrow: "7",
          boxSizing: "border-box",
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "nowrap",
              maxHeight: "35px",
              paddingLeft: "4px",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              overflow: "hidden",
              minWidth: 0,
            }}
            id={`${entityName}multiselectlookupid`}
            data-selected-items={display}
          >
            {/* <input type="hidden" id={`${entityName}multiselectlookupinputid`} value={display}></input> */}
            {display[0]}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ marginRight: "2px" }}>
            {numberOfItems > 0 ? "+" + numberOfItems : null}
          </div>
        </div>
      </div>
      {window.location.href.includes("portal") ? (
        portalRecordStatus? null :
        <div
          onClick={onButtonClick}
          id={entityName+"modalbuttonid"}
          style={{
            pointerEvents:portalRecordStatus? "none" : "auto",
            background: buttonColor,
            color: iconColor,
            height: "35px",
            width: "41px",
            border: `1px solid ${iconColor}`,
            boxSizing: "border-box",
            borderRadius: "0px",
            margin: "-1px",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <i
            className="fa fa-search"
            data-toggle="tooltip"
            title="Launch lookup modal"
          ></i>
        </div>
      ) : (
        <IconButton
          id={entityName+"modalbuttonid"}
          iconProps={SearchIcon}
          ariaLabel="Search"
          onClick={onButtonClick}
          style={{
            background: buttonColor,
            color: iconColor,
            height: "35px",
            width: "41px",
            border: `1px solid ${iconColor}`,
            boxSizing: "border-box",
            borderRadius: "0px",
            margin: "-1px",
          }}
        />
      )}
    </div>
  );
};
export default MainDisplay;
