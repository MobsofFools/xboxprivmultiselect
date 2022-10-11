import { useState } from "react";
import { IconButton } from "@fluentui/react/lib/Button";
import { IIconProps } from "@fluentui/react/lib/Icon";
import { IMainDisplay } from "./MainDisplay.types";
import {
  getEntityInitialResults,
  maintainSelectedEntityData,
} from "../functions/apicalls";

const MainDisplay = (props: IMainDisplay) => {
  const {
    setModalOpen,
    setColumnData,
    context,
    setNextLink,
    outputVariable,
    selection,
    setPageNumber,
  } = props;

  const displayProperty = context.parameters.displayedColumn.raw!;
  const buttonColor = context.parameters.buttonColor.raw! || "rgb(141,202,82)";
  const iconColor = context.parameters.iconColor.raw! || "white";
  const onButtonClick = async () => {
    setModalOpen(true);
    const data = await getEntityInitialResults(context);
    if (data) {
      if (typeof outputVariable === "string" && outputVariable.length > 0) {
        const json = JSON.parse(
          outputVariable
        ) as ComponentFramework.WebApi.Entity[];
        const merge = maintainSelectedEntityData(data.entities, json);
        setColumnData(merge);
        setPageNumber(1);
        selection.setRangeSelected(0, json.length, true, false);
      } else {
        setColumnData(data.entities);
      }
      setNextLink(data.nextLink);
    }
  };

  const SearchIcon: IIconProps = { iconName: "Search" };

  const getDisplayArray = () => {
    const array: string[] = [];
    if (outputVariable) {
      const json = JSON.parse(outputVariable);
      json.forEach((item: any) => {
        array.push(item[displayProperty]);
      });
    }
    return array;
  };
  const display = getDisplayArray();
  const numberOfItems = display.length - 1;

  return (
    <div
      style={{
        border: "1px solid rgb(216,216,216)",
        width: "98%",
        maxWidth: "300px",
        display: "flex",
        minHeight:"34px",
        justifyContent:"space-between"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            paddingLeft:"4px",
            maxWidth:"250px",
          }}
        >
          {display[0]}
        </div>
        
      </div>
      <div style={{display:"flex", alignItems:"center"}}>
      <div style={{marginRight:"2px"}}>
        {numberOfItems > 0 ? "+" + numberOfItems : null}
      </div>
      <IconButton
        iconProps={SearchIcon}
        ariaLabel="Search"
        onClick={onButtonClick}
        style={{
          background: buttonColor,
          color: iconColor,
          height:"100%"
        }}
      />
      </div>
    </div>
  );
};
export default MainDisplay;
