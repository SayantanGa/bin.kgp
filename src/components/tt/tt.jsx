import { useState } from "react";
import { generateTruthTable } from "../../scripts/expression_calculator";
import "./tt.css";

function Info() {
  return (
    <div className="tt-rules">
      <p>
        <ul>
          <li>
            <strong>Variables: </strong>Each variable will contain one and only
            one capital letter, and must start with it. It may contain one or
            more small case letters, numbers but no special characters.
          </li>
          <li>
            <strong>Boolean operators: </strong>NOT(postfix): ' XOR: ^ AND: .
            OR: + Precedence: NOT {">"} XOR {">"} AND {">"} OR Use of AND is
            optional: two adjacent variables with no operator will be ANDed.
          </li>
          <li>
            <strong>Example: </strong>AB'+A'B
          </li>
        </ul>
      </p>
    </div>
  );
}

function Headers({ variables }) {
  const vars = [...variables].map((variable) => (
    <th key={variable}>{variable}</th>
  ));

  return <>{vars}</>;
}

function Rows({ vars, f }) {
  const tt = generateTruthTable(vars, f);
  const rows = [...new Array(2 ** vars.length)].map((_, i) => {
    const binaryString = i.toString(2).padStart(vars.length, "0");
    return (
      <tr
        key={i}
        style={{
          backgroundColor: `${
            tt[i] ? "rgba(0,128,0,0.2)" : "rgba(169,169,169,0.25)"
          }`,
        }}
      >
        {binaryString.split("").map((el, index) => (
          <td key={index}>{el}</td>
        ))}
        <td>{tt[i] ? 1 : 0}</td>
      </tr>
    );
  });

  return <>{rows}</>;
}

export default function Tt({ showMobileView }) {
  const [inString, setInString] = useState("");
  const [variables, setVariables] = useState([]);
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="tt">
      <div className="tt-header">
        {!showInfo && (
          <h1>
            <span>
              Generate
              <br />
              TruthTable
            </span>
          </h1>
        )}
        {showMobileView === true && (
          <button
            className="Info-button"
            onClick={() => {
              setShowInfo(!showInfo);
            }}
          >
            <span class="material-symbols-outlined">
              {showInfo ? "close" : "info"}
            </span>
          </button>
        )}

        {(!showMobileView || showInfo) && <Info />}
      </div>
      {!showInfo && (
        <div className="tt-body">
          <div className="tt-input">
            <span className="material-symbols-outlined">function</span>
            <input
              type="text"
              className="expression-input"
              value={inString}
              onChange={(e) => {
                setInString(e.target.value);
                setVariables(
                  Array.from(
                    new Set(e.target.value.match(/[A-Z][a-z]*[0-9]*[a-z]*/g))
                  ).sort()
                );
              }}
            />
          </div>
          {variables.length > 0 && (
            <div className="tt-result">
              <table className="tt-table">
                <thead>
                  <tr>
                    <Headers variables={variables} />
                    <th>f</th>
                  </tr>
                </thead>
                <tbody>
                  <Rows vars={variables} f={inString} />
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
