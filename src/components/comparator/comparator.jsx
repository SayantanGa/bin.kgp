import { useState } from "react";
import { compareExpressions } from "../../scripts/expression_calculator";
import "./comparator.css";

function Info() {
  return (
    <div className="Comparator-rules">
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
export default function Comparator({ showMobileView }) {
  const [inString1, setInString1] = useState("");
  const [inString2, setInString2] = useState("");
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="Comparator">
      {!showInfo && (
        <div className="Comparator-header">
          <h1>
            <span>
              Compare
              <br />
              Expressions
            </span>
            <span>&nbsp;</span>
          </h1>
        </div>
      )}
      <div className="Comparator-body">
        {!showInfo && (
          <div className="Comparator-input">
            <span className="material-symbols-outlined">function</span>
            <input
              type="text"
              className="Comparator-exp-input"
              value={inString1}
              onChange={(e) => {
                setInString1(e.target.value);
              }}
            />
            <br />
            <span className="material-symbols-outlined">function</span>
            <input
              type="text"
              className="Comparator-exp-input"
              value={inString2}
              onChange={(e) => {
                setInString2(e.target.value);
              }}
            />
          </div>
        )}
        {!showInfo && inString1 && (
          <div
            className="Comparator-result"
            style={{
              backgroundColor: `${
                compareExpressions(inString1, inString2)
                  ? "rgba(0,128,0,0.2)"
                  : "#e060446e"
              }`,
            }}
          >
            <span class="material-symbols-outlined">
              {compareExpressions(inString1, inString2) ? "equal" : "cancel"}
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
