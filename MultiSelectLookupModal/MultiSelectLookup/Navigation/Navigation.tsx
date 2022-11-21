import { INavigation } from "./Navigation.types";
import { IIconProps } from "@fluentui/react/lib/Icon";
import { IconButton } from "@fluentui/react/lib/Button";
import { mergeStyleSets } from "@fluentui/react/lib/Styling";
const Navigation = (props: INavigation) => {
  const {pageNumber, nextLink,fetchXMLPagingCookie, getRequestedPage, setPageNumber, isPortal, portalDataSize } = props;

  const ChevronLeft: IIconProps = { iconName: "ChevronLeft" };
  const ChevronRight: IIconProps = { iconName: "ChevronRight" };
  let lastPage = pageNumber - 1;
  let nextPage = pageNumber + 1;
  const classNames = mergeStyleSets({
    navigationNumber: {
      height: "32px",
      width: "32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor:"pointer",
    },
    currentNavNumber: {
      height: "32px",
      width: "32px",
      background: "rgb(0,123,255)",
      borderRadius: "50%",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  });

  const handleBackPage = () => {
    getRequestedPage(lastPage)
    setPageNumber(pageNumber-1)
  }
  const handleForwardPage = () => {
    getRequestedPage(nextPage)
    setPageNumber(pageNumber+1)
  }
  const handleNumberButtonClick = (pagenum:number) => {
    getRequestedPage(pagenum);
    setPageNumber(pagenum);
  }
if(isPortal){
  if(portalDataSize){
    const numberofPages = Math.ceil(portalDataSize/50);
    return (
<div style={{ display: "flex", alignItems: "center" ,margin:"8px"}}>
      {lastPage > 0 ? (
        <>
          <IconButton
            iconProps={ChevronLeft}
            onClick={handleBackPage}
          />
          <div className={classNames.navigationNumber} onClick={()=>handleNumberButtonClick(lastPage)}>{lastPage}</div>
        </>
      ) : (
        <>
          <IconButton iconProps={ChevronLeft} disabled />
          <div className={classNames.navigationNumber}></div>
        </>
      )}
      <div className={classNames.currentNavNumber}>{pageNumber}</div>
      {numberofPages > pageNumber? (
        <>
          <div className={classNames.navigationNumber} onClick={()=>handleNumberButtonClick(nextPage)}>{nextPage}</div>
          <IconButton
            iconProps={ChevronRight}
            onClick={handleForwardPage}
          />
        </>
      ) : (
        <>
          <div className={classNames.navigationNumber}></div>
          <IconButton iconProps={ChevronRight} disabled />
        </>
      )}
    </div>
    );
  }
}
  return (
    <div style={{ display: "flex", alignItems: "center" ,margin:"8px"}}>
      {lastPage > 0 ? (
        <>
          <IconButton
            iconProps={ChevronLeft}
            onClick={handleBackPage}
          />
          <div className={classNames.navigationNumber} onClick={()=>handleNumberButtonClick(lastPage)}>{lastPage}</div>
        </>
      ) : (
        <>
          <IconButton iconProps={ChevronLeft} disabled />
          <div className={classNames.navigationNumber}></div>
        </>
      )}
      <div className={classNames.currentNavNumber}>{pageNumber}</div>
      {nextLink || fetchXMLPagingCookie ? (
        <>
          <div className={classNames.navigationNumber} onClick={()=>handleNumberButtonClick(nextPage)}>{nextPage}</div>
          <IconButton
            iconProps={ChevronRight}
            onClick={handleForwardPage}
          />
        </>
      ) : (
        <>
          <div className={classNames.navigationNumber}></div>
          <IconButton iconProps={ChevronRight} disabled />
        </>
      )}
    </div>
  );
};
export default Navigation;
