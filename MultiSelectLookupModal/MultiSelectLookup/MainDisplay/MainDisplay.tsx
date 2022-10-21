import { TooltipHost } from "@fluentui/react/lib/Tooltip";
import { IconButton } from "@fluentui/react/lib/Button";
import { IIconProps } from "@fluentui/react/lib/Icon";
import { IMainDisplay } from "./MainDisplay.types";
import { useId } from "@fluentui/react-hooks";
import {
  getEntityInitialResults,
  maintainSelectedEntityData,
} from "../functions/apicalls";
import { BUTTON_COLOR, ICON_COLOR } from "../constants";
const MainDisplay = (props: IMainDisplay) => {
  const {
    setModalOpen,
    setColumnData,
    context,
    setNextLink,
    outputVariable,
    selection,
    setPageNumber,
    setError
  } = props;

  const displayProperty = context.parameters.displayedColumn.raw!;
  const buttonColor = context.parameters.buttonColor.raw! || BUTTON_COLOR;
  const iconColor = context.parameters.iconColor.raw! || ICON_COLOR;
  const onButtonClick = async () => {
    setModalOpen(true);
    const data = await getEntityInitialResults(context).catch(error =>setError(true));
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
  const getBorderColor = () => {
    if(window.location.href.includes("portal"))
    {
      return "rgb(148,148,148)"
    }
    else {
      return "rgb(216,216,216)"
    }
  }
  const borderColor = getBorderColor();
  const getWidth = () => {
    if(window.location.href.includes("crm") || window.location.href.includes("dynamics")) {
      return "90%";
    }
    else {
      return "100%"
    }
  }
  const width = getWidth();
  return (
    <div
      style={{
        border: `1px solid ${borderColor}`,
        width: width,
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
