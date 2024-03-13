import { useEffect, useRef, useState } from "react";
import "./kmap.css";
import {
  KMapGroup,
  mintermsFromQMAlgorithm,
} from "../../scripts/expression_calculator";

const layout = (numVars) => {
  const layout3Vars = [
    [0, 1, 3, 2], // Row 1
    [4, 5, 7, 6], // Row 2
  ];

  const layout4Vars = [
    [0, 1, 3, 2], // Row 1
    [4, 5, 7, 6], // Row 2
    [12, 13, 15, 14], // Row 3
    [8, 9, 11, 10], // Row 4
  ];

  return numVars === 3 ? layout3Vars : layout4Vars;
};
const getTerms = (states, lit) => {
  let terms = [];
  for (let i = 0; i < states.length; i++) {
    if (states[i] === lit) {
      terms.push(i);
    }
  }
  return terms;
};
function KMapCover({ size, minterms, dontCares, colors, showMobileView }) {
  const groups = KMapGroup(size, minterms, dontCares);
  const kmLayout = layout(size);

  const topRow = kmLayout[0];
  const bottomRow = kmLayout[kmLayout.length - 1];
  const leftColumn = kmLayout.map((row) => row[0]);
  const rightColumn = kmLayout.map((row) => row[row.length - 1]);
  const middleElementsLR = kmLayout.map((row) => row.slice(1, row.length - 1));
  const middleElementsTB = kmLayout.slice(1, kmLayout.length - 1);
  const wrapsTop = (group) =>
    group.some((cell) => topRow.includes(cell)) &&
    !group.some((cell) => middleElementsTB.some((row) => row.includes(cell)));
  const wrapsBottom = (group) =>
    group.some((cell) => bottomRow.includes(cell)) &&
    !group.some((cell) => middleElementsTB.some((row) => row.includes(cell)));
  const wrapsLeft = (group) =>
    group.some((cell) => leftColumn.includes(cell)) &&
    !group.some((cell) => middleElementsLR.some((row) => row.includes(cell)));
  const wrapsRight = (group) =>
    group.some((cell) => rightColumn.includes(cell)) &&
    !group.some((cell) => middleElementsLR.some((row) => row.includes(cell)));

  // Function to detect and split edge-wrapped groups
  const splitEdgeWrappedGroup = (group) => {
    const newGroups = [];
    const groupsDivided = {
      LR: false,
      TB: false,
    };
    // Define the edges of the KMap

    // Split the group if it wraps, otherwise return it as is
    if (
      wrapsTop(group) &&
      wrapsLeft(group) &&
      wrapsRight(group) &&
      wrapsBottom(group)
    ) {
      groupsDivided.TB = true;
      groupsDivided.LR = true;
      newGroups.push(
        [kmLayout[0][0]],
        [kmLayout[0][kmLayout[0].length - 1]],
        [kmLayout[kmLayout.length - 1][0]],
        [
          kmLayout[kmLayout.length - 1][
            kmLayout[kmLayout.length - 1].length - 1
          ],
        ]
      );
    } else if (wrapsTop(group) && wrapsBottom(group)) {
      groupsDivided.TB = true;
      const newGrpTop = [],
        newGrpBottom = [];
      group.forEach((cell) => {
        if (topRow.includes(cell)) {
          newGrpTop.push(cell);
        }
        if (bottomRow.includes(cell)) {
          newGrpBottom.push(cell);
        }
      });
      newGroups.push(newGrpTop, newGrpBottom);
    } else if (wrapsLeft(group) && wrapsRight(group)) {
      // Split horizontally
      groupsDivided.LR = true;
      const newGrpLeft = [],
        newGrpRight = [];
      group.forEach((cell) => {
        if (leftColumn.includes(cell)) {
          newGrpLeft.push(cell);
        }
        if (rightColumn.includes(cell)) {
          newGrpRight.push(cell);
        }
      });
      newGroups.push(newGrpLeft, newGrpRight);
    }
    return [newGroups.length ? newGroups : [group], groupsDivided]; // Placeholder for split groups
  };

  // Split groups that wrap around edges and create separate CellCovers
  const covers = groups.flatMap((group, index) => {
    const [splitGroups, groupsDivided] = splitEdgeWrappedGroup(group);
    return splitGroups.map((splitGroup, splitIndex) => (
      <CellCover
        key={`${index}_${splitIndex}`}
        coveredCells={splitGroup}
        color={colors[index]}
        numVars={size}
        wrapping={[
          wrapsTop(splitGroup) ? 1 : 0,
          wrapsRight(splitGroup) ? 1 : 0,
          wrapsBottom(splitGroup) ? 1 : 0,
          wrapsLeft(splitGroup) ? 1 : 0,
        ]}
        groupsDivided={groupsDivided}
        showMobileView={showMobileView}
      />
    ));
  });

  return <>{covers}</>;
}
function CellCover({
  coveredCells,
  color,
  numVars,
  wrapping,
  groupsDivided,
  showMobileView,
}) {
  const cellSize = showMobileView ? 15 : 5; // Size of each cell in the K-map
  const numRows = numVars === 3 ? 2 : 4;
  const numCols = 4;

  // Function to get row and column from cell index
  const getRowAndCol = (cellIndex) => {
    const flatLayout = layout(numVars).flat();
    const position = flatLayout.indexOf(cellIndex);
    return { row: Math.floor(position / numCols), col: position % numCols };
  };

  // Convert cell indices to rows and columns
  const rowsAndCols = coveredCells.map(getRowAndCol);

  // Determine min and max rows and columns
  const minRow = Math.min(...rowsAndCols.map((rc) => rc.row));
  const maxRow = Math.max(...rowsAndCols.map((rc) => rc.row));
  const minCol = Math.min(...rowsAndCols.map((rc) => rc.col));
  const maxCol = Math.max(...rowsAndCols.map((rc) => rc.col));

  // Calculate style
  let top = minRow * cellSize;
  let left = minCol * cellSize;
  let width = (maxCol - minCol + 1) * cellSize;
  let height = (maxRow - minRow + 1) * cellSize;

  // Initialize borders to be transparent
  const borders = {
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    borderLeft: "none",
  };

  // Apply color to borders that are not wrapping
  if (!groupsDivided.TB || (minRow > 0 && !wrapping[0])) {
    borders.borderTop = `4px solid ${color}`;
  }
  if (!groupsDivided.TB || (maxRow < numRows - 1 && !wrapping[2])) {
    borders.borderBottom = `4px solid ${color}`;
  }
  if (!groupsDivided.LR || (minCol > 0 && !wrapping[3])) {
    borders.borderLeft = `4px solid ${color}`;
  }
  if (!groupsDivided.LR || (maxCol < numCols - 1 && !wrapping[1])) {
    borders.borderRight = `4px solid ${color}`;
  }

  const style = {
    position: "absolute",
    zIndex: -1,
    borderRadius: "15%",
    top: `${top}vw`,
    left: `${left}vw`,
    width: `${width}vw`,
    height: `${height}vw`,
    transform: "scale(0.9)",
    ...borders,
  };

  return <div style={style}></div>;
}

const KMapTable = ({ numVariables, states, setStates, mode }) => {
  const kMapLayout = layout(numVariables);

  return (
    <table className="kmap-table">
      <tbody>
        {kMapLayout.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cellValue) => (
              <td
                key={cellValue}
                onClick={() => {
                  if (mode === "min") {
                    setStates(
                      states.map((state, index) =>
                        index === cellValue
                          ? state === "0"
                            ? "1"
                            : state === "1"
                            ? "x"
                            : "0"
                          : state
                      )
                    );
                  } else {
                    setStates(
                      states.map((state, index) =>
                        index === cellValue
                          ? state === "0"
                            ? "x"
                            : state === "1"
                            ? "0"
                            : "1"
                          : state
                      )
                    );
                  }
                }}
              >
                <span className="kmap-cellstate">{states[cellValue]}</span>
                <span className="kmap-cellvalue">{cellValue}</span>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

function ResultantExpression({ colors, size, minterms, dontCares, mode }) {
  const groups = KMapGroup(size, minterms, dontCares);
  const expressions = groups.map((group) =>
    mintermsFromQMAlgorithm(
      size,
      group,
      [],
      undefined,
      mode === "min" ? false : true
    )
  );
  const expression = expressions.map((el, i) => (
    <span style={{ color: `${colors[i]}` }} key={i}>
      {el}
      {mode === "min" && i !== expressions.length - 1 ? (
        <span style={{ color: "black" }}> + </span>
      ) : null}
    </span>
  ));
  return <>{expression}</>;
}

export default function Kmap({ showMobileView }) {
  const [size, setSize] = useState(4);
  const [mode, setMode] = useState("min");
  const [states, setStates] = useState(
    Array.from({ length: size * size }, () => (mode === "max" ? "1" : "0"))
  );
  const colors = [
    "red",
    "blue",
    "green",
    "orange",
    "purple",
    "pink",
    "cyan",
    "magenta",
    "teal",
    "lavender",
    "brown",
    "olive",
    "maroon",
    "yellow",
    "navy",
    "aquamarine",
    "turquoise",
    "silver",
    "lime",
    "indigo",
    "violet",
    "peach",
    "gold",
    "plum",
    "orchid",
    "tan",
    "salmon",
    "khaki",
    "azure",
    "crimson",
    "scarlet",
    "denim",
    "coral",
  ];
  return (
    <div className="kmap">
      <div className="kmap-header">
        <h1>
          <span>K-Maps!</span>
        </h1>
        {!showMobileView && (
          <div className="kmap-rules">
            <p>
              Click on any cell to change state. Allowed states are: 0, 1, x
              <em>(don't care)</em>
            </p>
          </div>
        )}
        <div className="kmap-mode">
          <label>
            <span>Maxterms</span>
            <input
              type="checkbox"
              checked={mode === "max"}
              onChange={() => {
                setMode(mode === "min" ? "max" : "min");
                setStates(
                  Array.from({ length: size * size }, () =>
                    mode === "min" ? "1" : "0"
                  )
                );
              }}
              class="sr-only peer"
            />
            <div class="relative w-11 hover:cursor-pointer h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 -z-10"></div>
          </label>
          <label>
            <span>3-vars</span>
            <input
              type="checkbox"
              checked={size === 3}
              onChange={() => {
                size === 3 ? setSize(4) : setSize(3);
                const num = size === 3 ? 4 : 3;
                setStates(
                  Array.from({ length: num * num }, () =>
                    mode === "min" ? "0" : "1"
                  )
                );
              }}
              class="sr-only peer"
            />
            <div class="relative w-11 hover:cursor-pointer h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 -z-10"></div>
          </label>
        </div>
      </div>
      <div className="kmap-body">
        <div className="kmap-input">
          <div className="kmap-table-div">
            <KMapTable
              numVariables={size}
              states={states}
              setStates={setStates}
              mode={mode}
            />
            <KMapCover
              size={size}
              minterms={getTerms(states, mode === "min" ? "1" : "0")}
              dontCares={getTerms(states, "x")}
              colors={colors}
              showMobileView={showMobileView}
            />
          </div>
        </div>
        <div className="kmap-result">
          <ResultantExpression
            colors={colors}
            size={size}
            minterms={getTerms(states, mode === "min" ? "1" : "0")}
            dontCares={getTerms(states, "x")}
            mode={mode}
          />
        </div>
      </div>
    </div>
  );
}
