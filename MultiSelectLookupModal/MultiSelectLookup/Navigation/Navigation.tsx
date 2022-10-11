import { INavigation } from "./Navigation.types";
import { IIconProps } from "@fluentui/react/lib/Icon";
import { IconButton } from "@fluentui/react/lib/Button";
import { mergeStyleSets } from "@fluentui/react/lib/Styling";
const Navigation = (props: INavigation) => {
  const {pageNumber, nextLink,fetchXMLPagingCookie, getRequestedPage, setPageNumber } = props;

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

  const handleBackPage = async() => {
    getRequestedPage(lastPage)
    setPageNumber(pageNumber-1)
  }
  const handleForwardPage = () => {
    getRequestedPage(nextPage)
    setPageNumber(pageNumber+1)
  }

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {lastPage > 0 ? (
        <>
          <IconButton
            iconProps={ChevronLeft}
            onClick={handleBackPage}
          />
          <div className={classNames.navigationNumber}>{lastPage}</div>
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
          <div className={classNames.navigationNumber}>{nextPage}</div>
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
