import { mergeStyleSets } from "@fluentui/react";
import { IEntitySelector } from "./EntitySelector.types";

const EntitySelector = (props: IEntitySelector) => {
    const { entity, title, removeTag } = props;
    const styles = mergeStyleSets({
        container: {
            marginTop:"8px",
            minWidth:"150px",
            width:"150px",
            display: "flex",
            height: "32px",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "0 4px",
            background:"#fafafa",
            "&:hover": {
                background: "#F6F6F6"
            }
        },
        text: {  
            maxWidth: "110px",
            padding:"4px",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
        },
        button:{
            border: "none",
            width:"40px",
            height:"32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight:"0",
            "&:hover": {
                backgroundColor: "rgb(200, 200, 200)",
                fontWeight: 400,
                cursor:"pointer",
            }
        }
    })
    return (
        <div className={styles.container}>
            <div className={styles.text} title={title}>
                {title}
            </div>
            <div className={styles.button} onClick={() => removeTag(entity)}>
                <XSvg/>
            </div>
        </div>
    );
}
export default EntitySelector
export const XSvg = () => {
    return (
      <svg
        width="15px"
        height="15px"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.79289 7.49998L4.14645 4.85353L4.85355 4.14642L7.5 6.79287L10.1464 4.14642L10.8536 4.85353L8.20711 7.49998L10.8536 10.1464L10.1464 10.8535L7.5 8.20708L4.85355 10.8535L4.14645 10.1464L6.79289 7.49998Z"
          fill="black"
        />
      </svg>
    );
  };