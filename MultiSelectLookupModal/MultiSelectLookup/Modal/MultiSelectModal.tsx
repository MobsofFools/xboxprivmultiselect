import { useState, useEffect, createRef } from "react";
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
import { IRenderFunction, merge } from "@fluentui/react/lib/Utilities";
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
} from "../functions/apicalls";
import NewEntry from "../NewEntry/NewEntry";
import {
  BUTTON_COLOR,
  SELECT_BUTTON_COLOR,
  ICON_COLOR,
  SELECT_BUTTON_FONT_COLOR,
} from "../constants";
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
    error,
    setError,
    portalDataSet,
    portalDataSize,
    setPortalDataSet,
    setPortalDataSize,
  } = props;

  //#region State
  const [fetchXMLPagingCookie, setFetchXMLPagingCookie] = useState<string>();
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );
  const [search, setSearch] = useState<string>();
  const [isPanelOpen, setPanelOpen] = useState<boolean>(false);
  const [paneMargin, setPaneMargin] = useState<number>(150);
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
  const enableNew = context?.parameters.enableNew?.raw! || false;
  const redirectForNew = context?.parameters.redirectForNew?.raw! || "true";
  const displayProperty = context?.parameters.displayedColumn.raw!;
  const getRedirectURL = () => {
    const href = window.location.href;
    if (href.includes("powerappsportals")) {
      return context?.parameters.newPortalRedirectURL.raw!;
    }
    if (href.includes("crm")) {
      return context?.parameters.newCRMRedirectURL.raw!;
    }
    return "";
  };
  const redirectURL = getRedirectURL();
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
      return modalRef.current.clientHeight - paneMargin - 60;
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
        let minWidth = 100;
        for (let i = 0; i < columnArray.length; i++) {
          const tempColumn: IColumn = {
            key: useId(columnArray[i]),
            name: columnsHeadersArray[i],
            fieldName: columnArray[i],
            minWidth: minWidth,
            maxWidth: minWidth,
            isMultiline: true,
            isResizable: true,
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
    document
      .querySelector(".ms-ScrollablePane--contentContainer")
      ?.scrollTo(0, 0);
  };
  const handlePortalSearchClick = async () => {
    const prevSelection = selectionArray;
    if (search) {
      const data = await getPortalSearchResults(context, search);
      if (data) {
        setPortalDataSet(data.value);
        const slicedArray = data.value.slice(0, 50);
        const merge = maintainSelectedEntityData(slicedArray, prevSelection);
        setColumnData(merge);
        setPortalDataSize(data["@odata.count"]);
      }
    } else {
      const data = await getPortalInitialResults(context);
      
      if (data) {
        setPortalDataSet(data.value);
        const slicedArray = data.value.slice(0, 50);
        const merge = maintainSelectedEntityData(slicedArray, prevSelection);
        setColumnData(merge);
        setPortalDataSize(data["@odata.count"]);
      }
      
    }
    if (prevSelection) {
      selection.setRangeSelected(0, prevSelection.length, true, false);
    }
    setPageNumber(1);
    document
      .querySelector(".ms-ScrollablePane--contentContainer")
      ?.scrollTo(0, 0);
  };
  const handleOnCancelClick = () => {
    setModalOpen(false);
    setColumnData([]);
    setSelectionArray([]);
  };
  const handleOnSelectClick = () => {
    if(selectionArray && selectionArray.length > 0)
    {
      const outputJSON = JSON.stringify(selectionArray) 
      setOutputVariable(outputJSON);
      if(window.location.href.includes("portal")){
        const array: string[] = [];    
        selectionArray.forEach((item: any) => {
          array.push(item[displayProperty]);
        });
      sessionStorage.setItem(`${entityName}selectedItems`,array.toString())
      window.dispatchEvent(new Event("storage"));
      } 
    }
    else{
      setOutputVariable(undefined);
    }
    setModalOpen(false);
    setColumnData([]);
    setSelectionArray([]);
  };
  const handleOnClearClick = () => {
    setOutputVariable(undefined);
    setSelectionArray([]);
    selection.setAllSelected(false);
    if(window.location.href.includes("portal")){
    sessionStorage.removeItem(`${entityName}selectedItems`)
    window.dispatchEvent(new Event("storage"));
    } 
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
      let yaxis = selectIndex*50;
      document
      .querySelector(".ms-ScrollablePane--contentContainer")
      ?.scrollTo(0, yaxis);
    }
    else {
      document
      .querySelector(".ms-ScrollablePane--contentContainer")
      ?.scrollTo(0, 0);
    }
    setFetchXMLPagingCookie(any.fetchXmlPagingCookie);
  };
  const getPortalRequestedPage = async(page:number) => {
    const prevSelection = selectionArray;
    if(portalDataSet)
    {
      const slicedArray = portalDataSet.slice((page - 1)*50 , (page*50))
      setColumnData(maintainSelectedEntityData(slicedArray, prevSelection));
      if(prevSelection){
      const selectIndex = prevSelection.length;
      let yaxis = selectIndex*50;
      setTimeout(()=> {
        selection.setRangeSelected(0, selectIndex, true, false);
      },100)
      document
      .querySelector(".ms-ScrollablePane--contentContainer")
      ?.scrollTo(0, yaxis);
      }
      else{
        document
        .querySelector(".ms-ScrollablePane--contentContainer")
        ?.scrollTo(0, 0);
      }
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
  if (window.location.href.includes("portal")) {
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
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                borderBottom: "1px solid #e5e5e5",
                paddingTop: "15px",
                marginBottom: "9px",
                paddingBottom: "9px",
              }}
              ref={searchDivRef}
            >
              <input
                style={{
                  border: "1px solid rgb(216,216,216)",
                  height: "35px",
                  padding: "0 2px",
                  boxSizing: "border-box",
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
                  onClick={handlePortalSearchClick}
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
              <ScrollablePane
                style={{
                  height: "inherit",
                  paddingTop: 0,
                  marginTop: paneMargin,
                  marginBottom: "70px",
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
                  selection={selection}
                  selectionMode={SelectionMode.multiple}
                  selectionPreservedOnEmptyClick={true}
                  enterModalSelectionOnTouch={true}
                  ariaLabelForSelectionColumn="Toggle selection"
                  ariaLabelForSelectAllCheckbox="Toggle selection for all items"
                  checkButtonAriaLabel="select row"
                  onRenderRow={onRenderRow}
                  styles={{
                    root: {
                      overflowX:"hidden"
                    }
                  }}
                />
              </ScrollablePane>
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
                getRequestedPage={getPortalRequestedPage}
                portalDataSize={portalDataSize}
                isPortal={true}
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
                {enableNew ? (
                  redirectForNew ? (
                    <a
                      href={redirectURL}
                      style={{ marginLeft: 8 }}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <DefaultButton className={classNames.modalButton}>
                        New
                      </DefaultButton>
                    </a>
                  ) : (
                    <DefaultButton
                      className={classNames.modalButton}
                      onClick={handleOnNewClick}
                    >
                      New
                    </DefaultButton>
                  )
                ) : null}
              </div>
            </div>
          </div>
        </Modal>
        <Panel isOpen={isPanelOpen} onDismiss={dismissPanel}>
          {enableNew ? (
            redirectForNew ? null : (
              <NewEntry
                context={context}
                setColumnData={setColumnData}
                setPanelOpen={setPanelOpen}
                selection={selection}
                selectionArray={selectionArray}
              />
            )
          ) : null}
        </Panel>
      </>
    );
  }
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
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              borderBottom: "1px solid #e5e5e5",
              paddingTop: "15px",
              marginBottom: "9px",
              paddingBottom: "9px",
            }}
            ref={searchDivRef}
          >
            <input
              style={{
                border: "1px solid rgb(216,216,216)",
                height: "35px",
                padding: "0 2px",
                boxSizing: "border-box",
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
            <ScrollablePane
              style={{
                height: "inherit",
                paddingTop: 0,
                marginTop: paneMargin,
                marginBottom: "70px",
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
              getRequestedPage={getRequestedPage}
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
              {enableNew ? (
                redirectForNew ? (
                  <a
                    href={redirectURL}
                    style={{ marginLeft: 8 }}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <DefaultButton className={classNames.modalButton}>
                      New
                    </DefaultButton>
                  </a>
                ) : (
                  <DefaultButton
                    className={classNames.modalButton}
                    onClick={handleOnNewClick}
                  >
                    New
                  </DefaultButton>
                )
              ) : null}
            </div>
          </div>
        </div>
      </Modal>
      <Panel isOpen={isPanelOpen} onDismiss={dismissPanel}>
        {enableNew ? (
          redirectForNew ? null : (
            <NewEntry
              context={context}
              setColumnData={setColumnData}
              setPanelOpen={setPanelOpen}
              selection={selection}
              selectionArray={selectionArray}
            />
          )
        ) : null}
      </Panel>
    </>
  );
};
export default MultiSelectModal;
