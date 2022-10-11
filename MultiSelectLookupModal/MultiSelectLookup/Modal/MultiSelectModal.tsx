import { useState, useEffect } from "react";
import { IIconProps } from "@fluentui/react/lib/Icon";
import { Modal } from "@fluentui/react/lib/Modal";
import { TooltipHost } from "@fluentui/react/lib/Tooltip";
import {
  DetailsList,
  SelectionMode,
  IColumn,
  IDetailsHeaderProps,
  IDetailsColumnRenderTooltipProps,
  IDetailsRowProps,
} from "@fluentui/react/lib/DetailsList";
import { mergeStyleSets } from "@fluentui/react/lib/Styling";
import { Sticky, StickyPositionType } from "@fluentui/react/lib/Sticky";
import { IRenderFunction } from "@fluentui/react/lib/Utilities";
import { DefaultButton, IconButton } from "@fluentui/react/lib/Button";
import { IMultiSelectModal } from "./MultiSelectModal.types";
import { useId } from "@fluentui/react-hooks";
import Navigation from "../Navigation/Navigation";
import { Panel, ScrollablePane } from "@fluentui/react";
import {
  getEntityInitialResults,
  getEntitySearchResults,
  maintainSelectedEntityData,
  getSearchPage,
} from "../functions/apicalls";
import NewEntry from "../NewEntry/NewEntry";

const MultiSelectModal = (props: IMultiSelectModal) => {
  const {
    isModalOpen,
    setModalOpen,
    context,
    columnData,
    setColumnData,
    nextLink,
    setNextLink,
    setOutputVariable,
    selectionArray,
    setSelectionArray,
    selection,
    pageNumber,
    setPageNumber,
  } = props;

  //#region State
  const [fetchXMLPagingCookie, setFetchXMLPagingCookie] = useState<string>();
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );
  const [search, setSearch] = useState<string>();
  const [isPanelOpen, setPanelOpen] = useState<boolean>(false);
  //#endregion

  //#region Context Variables
  const buttonColor = context.parameters.buttonColor.raw! || "rgb(141,202,82)";
  const iconColor = context.parameters.iconColor.raw! || "white";
  const selectedColumns = context?.parameters.selectedColumns.raw!;
  const selectedColumnsHeaders =
    context?.parameters.selectedColumnsHeaders.raw!;
  const isModalSmall = context?.parameters.isModalSmall.raw! || "true";
  const enableNew = context?.parameters.enableNew?.raw! || false;
  const classNames = mergeStyleSets({
    hideSquare: {
      "span[role=checkbox]": {
        border: "none !important",
      },
    },
  });
  const getSize = (small: string) => {
    const largeModalSize = {
      topHeight: windowDimensions.height * 0.65,
      topWidth: windowDimensions.width * 0.65,
      listHeight: windowDimensions.height * 0.475,
      headingFontSize: windowDimensions.height * 0.025,
    };
    const smallModalSize = {
      topHeight: windowDimensions.height * 0.4,
      topWidth: windowDimensions.width * 0.4,
      listHeight: windowDimensions.height * 0.275,
      headingFontSize: windowDimensions.height * 0.02,
    };
    if (small === "true") {
      return smallModalSize;
    } else {
      return largeModalSize;
    }
  };
  const size = getSize(isModalSmall);

  //#endregion

  //#region Icons
  const SearchIcon: IIconProps = { iconName: "Search" };
  const CancelIcon: IIconProps = { iconName: "Cancel" };
  const AddIcon: IIconProps = { iconName: "Add" };
  //#endregion

  function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height,
    };
  }
  //#region get and set columns
  const getColumns = () => {
    const columns: IColumn[] = [];
    if (selectedColumns && selectedColumnsHeaders) {
      const columnArray = selectedColumns.split(",");
      const columnsHeadersArray = selectedColumnsHeaders.split(",");
      if (
        columnArray.length === columnsHeadersArray.length &&
        columnArray.length > 0
      ) {
        let minWidth;
        if (isModalSmall === "true") {
          minWidth = (windowDimensions.width * 0.3) / columnArray.length;
        } else {
          minWidth = (windowDimensions.width * 0.4) / columnArray.length;
        }
        for (let i = 0; i < columnArray.length; i++) {
          const tempColumn: IColumn = {
            key: useId(columnArray[i]),
            name: columnsHeadersArray[i],
            fieldName: columnArray[i],
            minWidth: minWidth || 50,
            maxWidth: minWidth || 50,
            isMultiline: true,
          };
          columns.push(tempColumn);
        }
      }
    }
    return columns;
  };
  const columns = getColumns();
  const onRenderDetailsHeader: IRenderFunction<IDetailsHeaderProps> = (
    props,
    defaultRender
  ) => {
    if (!props) {
      return null;
    }
    const onRenderColumnHeaderTooltip: IRenderFunction<
      IDetailsColumnRenderTooltipProps
    > = (tooltipHostProps) => <TooltipHost {...tooltipHostProps} />;
    return (
      <Sticky stickyPosition={StickyPositionType.Header} isScrollSynced>
        {defaultRender!({
          ...props,
          onRenderColumnHeaderTooltip,
        })}
      </Sticky>
    );
  };
  const onRenderRow: IRenderFunction<IDetailsRowProps> = (
    props,
    defaultRender
  ) => {
    if (!props) {
      return null;
    }
    return (
      <div data-selection-toggle="true">
        {defaultRender && defaultRender(props)}
      </div>
    );
  };
  //#endregion

  //#region Event Handlers
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleOnSearchClick = async () => {
    const prevSelection = selectionArray;
    if (search) {
      const data = await getEntitySearchResults(context, search);
      if (data) {
        const merge = maintainSelectedEntityData(data.entities, prevSelection);
        setColumnData(merge);
        setNextLink(data.nextLink);
      }
    } else {
      const data = await getEntityInitialResults(context);
      if (data) {
        const merge = maintainSelectedEntityData(data.entities, prevSelection);
        setColumnData(merge);
        setNextLink(data.nextLink);
      }
    }
    if (prevSelection) {
      selection.setRangeSelected(0, prevSelection.length, true, false);
    }
    setPageNumber(1);
  };
  const handleOnCancelClick = () => {
    setModalOpen(false);
    setColumnData([]);
    setSelectionArray([]);
  };
  const handleOnSelectClick = () => {
    setOutputVariable(JSON.stringify(selectionArray));
    setModalOpen(false);
    setColumnData([]);
    setSelectionArray([]);
  };
  const handleOnNewClick = () => {
    setPanelOpen(true);
  };
  const dismissPanel = () => {
    setPanelOpen(false);
  };
  //#endregion
  const getRequestedPage = async (page: number) => {
    const prevSelection = selectionArray;
    const data = await getSearchPage(context, page, search);
    const any = data as any;
    setNextLink(data.nextLink);
    setColumnData(maintainSelectedEntityData(data.entities, prevSelection));
    if (prevSelection) {
      const selectIndex = prevSelection.length;
      selection.setRangeSelected(0, selectIndex, true, false);
    }
    setFetchXMLPagingCookie(any.fetchXmlPagingCookie);
  };
  //#region useEffect

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    console.log(columnData)
  }, [columnData]);

  //#endregion

  return (
    <>
      <Modal isOpen={isModalOpen}>
        <div
          style={{
            maxWidth: windowDimensions.width * 0.9,
            maxHeight: windowDimensions.height * 0.9,
            width: size.topWidth,
            height: size.topHeight,
            padding: "8px",
            position: "relative",
          }}
        >
          <div style={{ position: "absolute", top: 0, right: 0 }}>
            <IconButton onClick={handleOnCancelClick} iconProps={CancelIcon} />
          </div>
          <div>
            <div>
              <div style={{ fontSize: size.headingFontSize }}>
                Lookup Records
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end",
              }}
            >
              <div style={{ fontSize: windowDimensions.height * 0.015 }}>
                Choose your records and click select to continue
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  height: windowDimensions.height * 0.03,
                  minHeight: "10px",
                }}
              >
                <input
                  style={{
                    border: "1px solid rgb(216,216,216)",
                    borderRight: "none",
                    borderRadius: "1px 0px 1px 0px",
                    minHeight: "10px",
                  }}
                  placeholder={"Search"}
                  onChange={onSearchChange}
                ></input>
                <TooltipHost
                  id={useId("searchtooltip")}
                  setAriaDescribedBy={false}
                  content="Search"
                >
                  <IconButton
                    iconProps={SearchIcon}
                    ariaLabel="Search"
                    onClick={handleOnSearchClick}
                    style={{
                      border: "1px solid rgb(216,216,216)",
                      background: buttonColor,
                      color: iconColor,
                      height: windowDimensions.height * 0.03,
                      width: windowDimensions.height * 0.03,
                      minHeight: "10px",
                      minWidth: "10px",
                      maxHeight: "32px",
                      maxWidth: "32px",
                    }}
                  />
                </TooltipHost>
              </div>
            </div>
          </div>
          <div
            style={{
              overflow: "auto",
              height: size.listHeight,
              width: "100%",
              margin: "auto",
            }}
          >
            <ScrollablePane
              style={{
                height: "inherit",
                paddingTop: 0,
                marginTop: windowDimensions.height * 0.09,
                marginBottom: "8px",
                width: "inherit",
              }}
            >
              <DetailsList
                className={classNames.hideSquare}
                items={columnData}
                columns={columns}
                isHeaderVisible={true}
                onRenderDetailsHeader={onRenderDetailsHeader}
                selection={selection}
                selectionMode={SelectionMode.multiple}
                selectionPreservedOnEmptyClick={true}
                enterModalSelectionOnTouch={true}
                ariaLabelForSelectionColumn="Toggle selection"
                ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                checkButtonAriaLabel="select row"
                onRenderRow={onRenderRow}
              />
            </ScrollablePane>
          </div>
          <div
            style={{
              position: "absolute",
              bottom: "8px",
              left: "8px",
            }}
          >
            <Navigation
              context={context}
              pageNumber={pageNumber || 1}
              setPageNumber={setPageNumber}
              nextLink={nextLink}
              fetchXMLPagingCookie={fetchXMLPagingCookie}
              setColumnData={setColumnData}
              getRequestedPage={getRequestedPage}
              windowDimensions={windowDimensions}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              position: "absolute",
              bottom: 8,
              right: 8,
            }}
          >
            <DefaultButton
              style={{
                background: buttonColor,
                color: "white",
                marginRight: "8px",
                width: windowDimensions.height * 0.075,
                minWidth: "40px",
                height: windowDimensions.height * 0.03,
                minHeight: "16px",
                fontSize: windowDimensions.height * 0.013,
              }}
              onClick={handleOnSelectClick}
            >
              Select
            </DefaultButton>
            <DefaultButton
              style={{
                width: windowDimensions.height * 0.075,
                minWidth: "40px",
                height: windowDimensions.height * 0.03,
                minHeight: "16px",
                fontSize: windowDimensions.height * 0.013,
              }}
              onClick={handleOnCancelClick}
            >
              Cancel
            </DefaultButton>
            {enableNew ? (
              <DefaultButton
                style={{
                  width: windowDimensions.height * 0.075,
                  minWidth: "40px",
                  height: windowDimensions.height * 0.03,
                  minHeight: "16px",
                  fontSize: windowDimensions.height * 0.013,
                }}
                onClick={handleOnNewClick}
              >
                New
              </DefaultButton>
            ) : null}
          </div>
        </div>
      </Modal>
      <Panel isOpen={isPanelOpen} onDismiss={dismissPanel}>
        {enableNew ? (
          <NewEntry
            context={context}
            setColumnData={setColumnData}
            setPanelOpen={setPanelOpen}
            selection={selection}
            selectionArray={selectionArray}
          />
        ) : null}
      </Panel>
    </>
  );
};
export default MultiSelectModal;
