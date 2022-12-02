import React, { useState, useEffect, createRef } from "react";
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
  CheckboxVisibility,
} from "@fluentui/react/lib/DetailsList";
import { mergeStyleSets } from "@fluentui/react/lib/Styling";
import { Sticky, StickyPositionType } from "@fluentui/react/lib/Sticky";
import { getId, IRenderFunction } from "@fluentui/react/lib/Utilities";
import { DefaultButton, IconButton } from "@fluentui/react/lib/Button";
import { IMultiSelectModal } from "./MultiSelectModal.types";
import { useId } from "@fluentui/react-hooks";
import Navigation from "../Navigation/Navigation";
import { ScrollablePane } from "@fluentui/react/lib/ScrollablePane";
import { Panel } from "@fluentui/react/lib/Panel";
import {
  getEntityInitialResults,
  getEntitySearchResults,
  maintainSelectedEntityData,
  getSearchPage,
  getPortalSearchResults,
  getPortalInitialResults,
  getEntityFilterResults,
  getPortalFilterResults,
} from "../functions/apicalls";
import NewEntry from "../NewEntry/NewEntry";
import {
  BUTTON_COLOR,
  SELECT_BUTTON_COLOR,
  ICON_COLOR,
  SELECT_BUTTON_FONT_COLOR,
} from "../constants";
import { Spinner, SpinnerSize } from "@fluentui/react";
import EntitySelector from "./EntitySelector";
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
    portalDataSet,
    portalDataSize,
    setPortalDataSet,
    setPortalDataSize,
    isLoading,
    setIsLoading
  } = props;

  //#region State
  const [fetchXMLPagingCookie, setFetchXMLPagingCookie] = useState<string>();
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );
  const [search, setSearch] = useState<string>("");
  const [isPanelOpen, setPanelOpen] = useState<boolean>(false);
  const [paneMargin, setPaneMargin] = useState<number>(150);
  const [errorText, setErrorText] = useState<string>("");

  const modalRef = createRef<HTMLDivElement>();
  const headerRef = createRef<HTMLDivElement>();
  const searchDivRef = createRef<HTMLDivElement>();
  const blurbDivRef = createRef<HTMLDivElement>();

  //#endregion

  //#region Context Variables
  const entityName = context.parameters.entityName.raw!;
  const buttonColor = context.parameters.buttonColor.raw! || BUTTON_COLOR;
  const selectButtonFontColor =
    context.parameters.selectButtonFontColor.raw! || SELECT_BUTTON_FONT_COLOR;
  const selectButtonColor =
    context.parameters.selectButtonColor.raw! || SELECT_BUTTON_COLOR;
  const iconColor = context.parameters.iconColor.raw! || ICON_COLOR;
  const selectedColumns = context?.parameters.selectedColumns.raw!;
  const selectedColumnsHeaders =
    context?.parameters.selectedColumnsHeaders.raw!;
  const displayProperty = context?.parameters.displayedColumn.raw!;

  const classNames = mergeStyleSets({
    modalClass: {
      "span[role=checkbox]": {
        border: "0px !important",
      },
      ".ms-DetailsHeader": {
        padding: "0px",
      },
      a: {
        padding: 0,
        margin: 0,
      },
      select: {
        borderColor: "none",
      }
      ,
      ".ms-DetailsHeader-cellName": {
        fontSize: "12.75",
        fontFamily:
          '"Segoe UI Light","Helvetica Neue",Helvetica,Arial,sans-serif !important',
        fontColor: "#767171 !important",
      },

      width: "80vw",
      "@media (min-width: 768px)": {
        margin: "0px auto",
      },
      "@media (min-height: 360px)": {
        height: "80vh",
      },
      "@media (min-height: 720px)": {
        height: "600px",
      },
      "@media (min-height: 1080px)": {
        height: "800px",
      },
      "@media (min-width: 992px)": {
        width: "900px",
      },
    },
    modalButton: {
      fontSize: "15px",
      padding: "6px 12px",
      fontFamily:
        '"Segoe UI Light","Helvetica Neue",Helvetica,Arial,sans-serif',
    },
  });

  const getListHeight = () => {
    if (modalRef.current) {
      return modalRef.current.clientHeight - paneMargin - 60 - 50;
    }
  };
  const listHeight = getListHeight();
  //#endregion

  //#region Icons
  const SearchIcon: IIconProps = { iconName: "Search" };
  const CancelIcon: IIconProps = { iconName: "Cancel" };
  const AddIcon: IIconProps = { iconName: "Add" };
  const RefreshIcon: IIconProps = { iconName: "Refresh" };
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
        let minWidth = 125;
        for (let i = 0; i < columnArray.length; i++) {
          const tempColumn: IColumn = {
            key: useId(columnArray[i]),
            name: columnsHeadersArray[i],
            fieldName: columnArray[i],
            minWidth: minWidth,
            maxWidth: minWidth,
            isMultiline: true,
            isResizable: true,
            isSorted: false,
            onColumnClick: _onColumnClick,
          };
          columns.push(tempColumn);
        }
      }
    }
    return columns;
  };
  const [columns, setColumns] = useState<IColumn[]>(getColumns());
  function _getKey(item: any, index?: number): string {
    return item.key;
  }
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

  const handleSetSortColumnData = async (fieldName: string, isSortedDescending?: boolean, searchVar?: string) => {
    if (window.location.href.includes("portal")) {
      const data = await getPortalFilterResults(context, fieldName, isSortedDescending, searchVar);
      setPortalDataSet(data.value);
      const slicedArray = data.value.slice(0, 50);
      console.log("Data to Set", slicedArray)
      setColumnData(slicedArray)
      setPageNumber(1);
      document.querySelector(".ms-ScrollablePane--contentContainer")?.scrollTo(0, 0);

    }
    else {
      const data = await getEntityFilterResults(context, fieldName, isSortedDescending, searchVar);
      setNextLink(data.nextLink);
      setColumnData(data.entities);
      document.querySelector(".ms-ScrollablePane--contentContainer")?.scrollTo(0, 0);
    }
    setPageNumber(1);
  }

  function _onColumnClick(ev: React.MouseEvent<HTMLElement, MouseEvent>, column: IColumn) {
    const input = document.getElementById(`${entityName}searchinput`) as HTMLInputElement
    const newColumns: IColumn[] = columns.slice();
    const currColumn: IColumn = newColumns.filter(currCol => column.key === currCol.key)[0]
    newColumns.forEach((newCol: IColumn) => {
      if (newCol === currColumn) {
        currColumn.isSortedDescending = !currColumn.isSortedDescending;
        currColumn.isSorted = true;

      } else {
        newCol.isSorted = false;
        newCol.isSortedDescending = true;
      }
    });
    setColumns(newColumns);
    handleSetSortColumnData(currColumn.fieldName!, currColumn.isSortedDescending, input.value);
    //selection.setAllSelected(false);
  }
  //#endregion

  //#region Event Handlers
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleOnSearchClick = async () => {
    setIsLoading(true)
    const prevSelection = selectionArray;
    if (search) {
      const data = await getEntitySearchResults(context, search);
      if (data) {
        setColumnData(data.entities);
        setSelectionArray(prevSelection);
        setNextLink(data.nextLink);
      }
    } else {
      const data = await getEntityInitialResults(context);
      if (data) {
        setColumnData(data.entities);
        setSelectionArray(prevSelection);
        setNextLink(data.nextLink);
      }
    }
    setPageNumber(1);
    selection.setAllSelected(false);
    setIsLoading(false)
    document.querySelector(".ms-ScrollablePane--contentContainer")?.scrollTo(0, 0);
  };
  const handlePortalSearchClick = async () => {
    setIsLoading(true)
    const prevSelection = selectionArray;
    if (search) {
      const data = await getPortalSearchResults(context, search);
      if (data) {
        setPortalDataSet(data.value);
        const slicedArray = data.value.slice(0, 50);
        setColumnData(slicedArray);
        setSelectionArray(prevSelection);
        setPortalDataSize(data["@odata.count"]);
        setIsLoading(false);
      }
    } else {
      const data = await getPortalInitialResults(context);
      if (data) {
        setPortalDataSet(data.value);
        const slicedArray = data.value.slice(0, 50);
        setColumnData(slicedArray);
        setSelectionArray(prevSelection);
        setPortalDataSize(data["@odata.count"]);
        setIsLoading(false);
      }
    }
    setPageNumber(1);
    setIsLoading(false);
    //selection.setAllSelected(false);
    document.querySelector(".ms-ScrollablePane--contentContainer")?.scrollTo(0, 0);
  };
  const handleOnCancelClick = () => {
    setModalOpen(false);
    setColumnData([]);
    setSelectionArray([]);
    setSearch("");
    setColumns(getColumns())
  };
  const handleOnSelectClick = () => {
    if (selectionArray && selectionArray.length > 0) {
      const outputJSON = JSON.stringify(selectionArray)
      setOutputVariable(outputJSON);
      if (window.location.href.includes("portal")) {
        const array: string[] = [];
        selectionArray.forEach((item: any) => {
          array.push(item[displayProperty]);
        });
        sessionStorage.setItem(`${entityName}selectedItems`, array.toString())
        window.dispatchEvent(new Event("storage"));
        setModalOpen(false);
      }
      setModalOpen(false);
    }
    else {
      setOutputVariable(undefined);
      handleNoItemsSelected();
    }
  };
  const handleOnClearClick = () => {
    setOutputVariable(undefined);
    setSelectionArray([]);
    setErrorText("");
    selection.setAllSelected(false);
    if (window.location.href.includes("portal")) {
      sessionStorage.removeItem(`${entityName}selectedItems`)
      window.dispatchEvent(new Event("storage"));
    }
  };
  const handleNoItemsSelected = () => {
    setErrorText("No Items Selected")
    setTimeout(() => {
      setErrorText("")
    }, 5000)
  }
  // const handleOnNewClick = () => {
  //   setPanelOpen(true);
  // };
  const dismissPanel = () => {
    setPanelOpen(false);
  };
  //#endregion
  const getRequestedPage = async (page: number) => {
    setIsLoading(true)
    const prevSelection = selectionArray;
    const data = await getSearchPage(context, page, columns, search);
    const any = data as any;
    setNextLink(data.nextLink);
    setColumnData(data.entities);
    setSelectionArray(prevSelection);
    setFetchXMLPagingCookie(any.fetchXmlPagingCookie);
    setIsLoading(false);
    selection.setAllSelected(false);
    document.querySelector(".ms-ScrollablePane--contentContainer")?.scrollTo(0, 0);
  };
  const getPortalRequestedPage = async (page: number) => {
    const prevSelection = selectionArray;
    if (portalDataSet) {
      const slicedArray = portalDataSet.slice((page - 1) * 50, (page * 50))
      setColumnData(slicedArray);
      setSelectionArray(prevSelection);
      selection.setAllSelected(false);
      document.querySelector(".ms-ScrollablePane--contentContainer")?.scrollTo(0, 0);
    }
  }
  const removeTag = (etn: ComponentFramework.WebApi.Entity) => {
    if (selectionArray) {

      const tempArray = selectionArray.filter(a => a[`${entityName}id`] !== etn[`${entityName}id`])
      setSelectionArray(tempArray);
    }
  }
  //#region useEffect

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  //#endregion
  useEffect(() => {
    if (blurbDivRef.current)
      setPaneMargin(
        blurbDivRef.current.offsetTop + blurbDivRef.current.offsetHeight
      );
  }, [headerRef, searchDivRef, blurbDivRef]);

  const getIsPortal = () => {
    if (window.location.href.includes("portal")) {
      return true;
    }
    return false;
  }
  const isPortal = getIsPortal();

  return (
    <>
      <Modal isOpen={isModalOpen}>
        <div className={classNames.modalClass} ref={modalRef}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              borderBottom: "1px solid #e5e5e5",
            }}
            ref={headerRef}
          >
            <h1
              style={{
                fontFamily:
                  '"Segoe UI Light","Helvetica Neue",Helvetica,Arial,sans-serif',
                fontWeight: 500,
                color: "#232222",
                lineHeight: "1.42857",
                fontSize: "21px",
                padding: "15px",
              }}
              className={"modal-title"}
            >
              Lookup Records
            </h1>
            <IconButton
              onClick={handleOnCancelClick}
              style={{ padding: "15px", marginRight: "8px" }}
              iconProps={CancelIcon}
            />
          </div>
          <div style={{
            display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e5e5e5",
            paddingTop: "15px",
            marginBottom: "9px",
            paddingBottom: "9px",
          }}>
            <div style={{ color: "red", fontWeight: 700, marginLeft: "16px" }}>
              {errorText}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",

              }}
              ref={searchDivRef}
            >
              <input
                id={`${entityName}searchinput`}
                style={{
                  border: "1px solid rgb(216,216,216)",
                  height: "35px",
                  padding: "0 2px",
                  boxSizing: "border-box",
                }}
                type="search"
                placeholder={"Search"}
                value={search}
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
                  onClick={isPortal ? handlePortalSearchClick : handleOnSearchClick}
                  style={{
                    border: `1px solid ${iconColor}`,
                    background: buttonColor,
                    color: iconColor,
                    height: "35px",
                    width: "35px",
                    borderRadius: "0px",
                    marginRight: "8px",
                  }}
                />
              </TooltipHost>
            </div>
          </div>
          <div
            style={{ fontSize: "12.75px", padding: "0px 15px" }}
            ref={blurbDivRef}
          >
            <span>Choose your records and click select to continue</span>
          </div>

          <div
            style={{
              overflow: "auto",
              height: listHeight,
              width: "100%",
            }}
          >
            {isLoading === true ?
              <div style={{ height: listHeight, display: "grid", justifyContent: "center", alignItems: "center", width: "80%", margin: "auto" }}>
                <Spinner size={SpinnerSize.large} />
              </div>
              :
              <ScrollablePane
                style={{
                  height: "inherit",
                  paddingTop: 0,
                  marginTop: paneMargin,
                  marginBottom: "110px",
                  width: "inherit",
                  display: "block",
                }}
                id={"multiselectmodalScrollablePaneId"}
              >
                <DetailsList
                  items={columnData}
                  columns={columns}
                  isHeaderVisible={true}
                  onRenderDetailsHeader={onRenderDetailsHeader}
                  checkboxVisibility={CheckboxVisibility.always}
                  // getKey={_getKey}
                  // setKey="xbox"
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
            }

          </div>
          <div style={{ height: "50px", paddingTop: "8px", width: "100%", borderTop: "1px solid #e5e5e5", boxSizing: "border-box", position: "absolute", bottom: "50px", overflowY: "hidden" }}>
            <div style={{ width: "95%", margin: "auto", display: "flex", alignItems: "center", maxLines: 1, overflowX: "auto" }}>
              {selectionArray?.map((item) => {
                return <EntitySelector entity={item} title={item[displayProperty]} removeTag={removeTag} key={getId("xbox")} />
              })}
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              borderTop: "1px solid #e5e5e5",
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              boxSizing: "border-box",
            }}
          >
            <Navigation
              context={context}
              pageNumber={pageNumber || 1}
              setPageNumber={setPageNumber}
              nextLink={nextLink}
              fetchXMLPagingCookie={fetchXMLPagingCookie}
              setColumnData={setColumnData}
              getRequestedPage={isPortal ? getPortalRequestedPage : getRequestedPage}
              portalDataSize={portalDataSize}
              isPortal={isPortal}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "end",
                margin: "8px",
              }}
            >
              <DefaultButton
                style={{
                  background: selectButtonColor,
                  color: selectButtonFontColor,
                  marginRight: "8px",
                }}
                className={classNames.modalButton}
                onClick={handleOnSelectClick}
              >
                Select
              </DefaultButton>
              <DefaultButton
                className={classNames.modalButton}
                onClick={handleOnCancelClick}
              >
                Cancel
              </DefaultButton>
              <DefaultButton
                style={{ marginLeft: 8 }}
                className={classNames.modalButton}
                onClick={handleOnClearClick}
              >
                Clear Selection
              </DefaultButton>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
export default MultiSelectModal;
