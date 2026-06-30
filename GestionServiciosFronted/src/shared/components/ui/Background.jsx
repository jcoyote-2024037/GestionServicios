import Island from "./Island";

function Background({ height = "400px", pattern }) {
  return (
    <div style={{ width: "100%", height }}>
      <Island pattern={pattern} />
    </div>
  );
}

export default Background;
