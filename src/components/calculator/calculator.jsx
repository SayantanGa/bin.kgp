import { useState } from "react";
import { calculateValue } from "../../scripts/expression_calculator";
import "./calculator.css";

function Info() {
  return (
    <div className="Calculator-rules">
      <p>
        <ul>
          <li>
            <strong>Variables: </strong>Each variable will contain one and only
            one capital letter, and must start with it. It may contain one or
            more small case letters, numbers but no special characters. Click on
            the variable values to toggle.
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

function Variables({ varValues, setVarValues, inString }) {
  const handleToggle = (varName, varValue) => {
    const newVarValues = new Map(varValues);
    newVarValues.set(varName, !varValue);
    setVarValues(newVarValues);
  };

  const variables = [...varValues].map(([varName, varValue]) => (
    <tr key={varName}>
      <td>{varName}</td>
      <td
        className="Variables-values"
        onClick={() => handleToggle(varName, varValue)}
      >
        {varValue ? 1 : 0}
      </td>
    </tr>
  ));

  return <>{variables}</>;
}
function mapVars(varList) {
  let mappedVars = new Map();
  varList.forEach((varName) => mappedVars.set(varName, false));
  return mappedVars;
}
export default function Calculator({ showMobileView }) {
  const [inString, setInString] = useState("");
  const [varValues, setVarValues] = useState(new Map());
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="Calculator">
      {showInfo === false && (
        <div className="Calculator-header">
          <h1>
            <span>
              Calculate
              <br />
              Expression
            </span>
            <span>&nbsp;</span>
          </h1>
          <table className="Variables-table">
            <thead>
              <tr>
                <th>
                  <span className="material-symbols-outlined">dataset</span>
                </th>
                <th>
                  <span className="material-symbols-outlined">
                    edit_attributes
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <Variables
                varValues={varValues}
                setVarValues={setVarValues}
                inString={inString}
              />
            </tbody>
          </table>
        </div>
      )}
      <div className="Calculator-body">
        {showInfo === false && (
          <div className="Calculator-input">
            <span className="material-symbols-outlined">function</span>
            <input
              type="text"
              className="expression-input"
              value={inString}
              onChange={(e) => {
                setInString(e.target.value);
                setVarValues(
                  mapVars(
                    Array.from(
                      new Set(inString.match(/[A-Z][a-z]*[0-9]*[a-z]*/g))
                    )
                  )
                );
              }}
            />
          </div>
        )}
        {inString !== "" && showInfo === false && (
          <div className="Calculator-result">
            <span class="material-symbols-outlined">equal</span>
            <span>
              {calculateValue(inString, Object.fromEntries(varValues)) ? 1 : 0}
            </span>
          </div>
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
    </div>
  );
}
