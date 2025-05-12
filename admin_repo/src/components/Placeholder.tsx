type PlaceholderProps = {
  type: string;
};

const Placeholder: React.FC<PlaceholderProps> = ({ type }) => {
  return (
    <div className="loader-wrap">
      {type === "spinner" && <div>Animated spinner will be here</div>}
      {type === "empty" && <h3>No data found design will be here</h3>}
    </div>
  );
};

export default Placeholder;
