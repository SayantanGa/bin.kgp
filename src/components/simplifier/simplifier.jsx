import { useState } from "react";
import "./simplifier.css";
import {
  generateTruthTable,
  mintermsFromQMAlgorithm,
} from "../../scripts/expression_calculator";

function Info() {
  return (
    <div className="simplifier-rules">
      <p>
        <ul>
          <li>
            <strong>Input: </strong>Enter an expression in the input box.
            Alternatively, minterms can be entered in the input box, separated
            by commas.
          </li>
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

export default function Simplifier({ showMobileView }) {
  const [inString, setInString] = useState("");
  const [inStringDC, setInStringDC] = useState("");
  const [inputType, setInputType] = useState("exp");
  const [variables, setVariables] = useState([]);
  const [output, setOutput] = useState("");
  const [showInfo, setShowInfo] = useState(false);

  const classifyInput = (inString) => {
    return inString.match(/[A-Z]/)
      ? "exp"
      : inString.match(/,/)
      ? "min"
      : inString.match(/\./)
      ? "max"
      : null;
  };

  function calculateOutput() {
    if (inputType === "min") {
      const minterms = Array.from(new Set(inString.split(",").map(Number)));
      const dontCares =
        inStringDC === ""
          ? []
          : Array.from(new Set(inStringDC.split(",").map(Number)));
      const size = Math.ceil(
        Math.log2(1 + Math.max(...minterms, ...dontCares))
      );
      return mintermsFromQMAlgorithm(size, minterms, dontCares);
    } else if (inputType === "exp") {
      const vars = Array.from(
        new Set(inString.match(/[A-Z][a-z]*[0-9]*[a-z]*/g))
      ).sort();
      const tt = generateTruthTable(vars, inString);
      const minterms = [];
      for (let i = 0; i < tt.length; i++) {
        if (tt[i]) minterms.push(i);
      }
      const size = Math.ceil(Math.log2(1 + Math.max(...minterms)));
      return mintermsFromQMAlgorithm(size, minterms, [], vars);
    }
  }

  return (
    <div className="simplifier">
      <div className="simplifier-header">
        {!showInfo && (
          <h1>
            <span>
              Simplify
              <br />
              Expressions
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
        <div className="simplifier-body">
          <div className="simplifier-input">
            <span className="material-symbols-outlined">
              {inputType === "exp"
                ? "function"
                : inputType === "max"
                ? "Π"
                : "functions"}
            </span>
            <input
              type="text"
              className="simplifier-expression-input"
              value={inString}
              onChange={(e) => {
                setInString(e.target.value);
                setInputType(classifyInput(inString));
                if (inputType === "exp")
                  setVariables(
                    Array.from(
                      new Set(e.target.value.match(/[A-Z][a-z]*[0-9]*[a-z]*/g))
                    )
                  );
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setOutput(calculateOutput());
                }
              }}
            />
            <br />
            {inputType !== "exp" && (
              <>
                {" "}
                <span>{inputType === "max" ? "." : "+"} dC </span>
                <input
                  type="text"
                  className="expression-input"
                  value={inStringDC}
                  onChange={(e) => {
                    setInStringDC(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setOutput(calculateOutput());
                    }
                  }}
                />
              </>
            )}
            <br />
            <span
              className="material-symbols-outlined simplifier-button"
              onClick={() => {
                setOutput(calculateOutput());
              }}
            >
              calculate
            </span>
          </div>
          <div className="simplifier-result">{output}</div>
        </div>
      )}
    </div>
  );
}
