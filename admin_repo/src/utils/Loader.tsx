import classNames from "classnames";

type LoaderProps = {
  position?: string;
  width?: string;
  height?: string;
  loaderWidth?: string;
  loaderHeight?: string;
};

const Loader: React.FC<LoaderProps> = ({
  position,
  width,
  height,
  loaderWidth,
  loaderHeight,
}) => {
  return (
    <div
      style={{
        width: `${width ? width : "100%"}`,
        height: `${height ? height : "100%"}`,
      }}
      className={classNames("loadingScreen", position ? position : "fixed")}
    >
      <div
        style={{
          width: `${loaderWidth ? loaderWidth : "100%"}`,
          height: `${loaderHeight ? loaderHeight : "100%"}`,
        }}
        className="loaderBox"
      ></div>
    </div>
  );
};

export default Loader;
