let OPERATORS = {
  "+": {
    function: (a, b) => a || b,
    associativity: "right",
    precedence: 1,
  },
  ".": {
    function: (a, b) => a && b,
    associativity: "right",
    precedence: 2,
  },
  "^": {
    function: (a, b) => a ^ b,
    associativity: "right",
    precedence: 3,
  },
  "'": {
    function: (a) => !a,
    associativity: "left",
    precedence: 4,
  },
};

export function calculateValue(string, variables = {}) {
  if (!string) return;
  const varStack = [];
  const operatorStack = [];
  let andAbillity = false;
  function operate(operator) {
    if (operator in OPERATORS) {
      if (operator === "'") {
        varStack.push(OPERATORS[operator].function(valueOf(varStack.pop())));
      } else
        varStack.push(
          OPERATORS[operator].function(
            valueOf(varStack.pop()),
            valueOf(varStack.pop())
          )
        );
    }
  }
  function valueOf(literal) {
    if (typeof literal === "string") {
      return variables[literal];
    }
    return literal;
  }
  function handleOperator(literal) {
    while (
      operatorStack.length > 0 &&
      operatorStack[operatorStack.length - 1] !== "(" &&
      (OPERATORS[operatorStack[operatorStack.length - 1]].precedence >
        OPERATORS[literal].precedence ||
        (OPERATORS[operatorStack[operatorStack.length - 1]].precedence ==
          OPERATORS[literal].precedence &&
          OPERATORS[literal].associativity === "left"))
    ) {
      operate(operatorStack.pop());
    }
    operatorStack.push(literal);
  }
  for (const literal of string) {
    if ([" ", "\\"].includes(literal)) continue;
    if (literal.match("[A-Z]")) {
      if (andAbillity) handleOperator(".");
      varStack.push(literal);
      andAbillity = true;
    } else if (literal.match("[a-z]")) {
      varStack[varStack.length - 1] += literal;
    } else if (literal.match(/[0-9]/) && andAbillity) {
      varStack[varStack.length - 1] += literal;
    } else if (literal.match(/[0-1]/) && !andAbillity) {
      varStack.push(parseInt(literal));
      andAbillity = true;
    } else if (literal in OPERATORS) {
      if (literal !== "'") andAbillity = false;
      handleOperator(literal);
    } else if (literal === "(") {
      if (andAbillity) {
        handleOperator(".");
        andAbillity = false;
      }
      operatorStack.push(literal);
    } else if (literal === ")") {
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1] !== "("
      ) {
        operate(operatorStack.pop());
      }
      operatorStack.pop();
      andAbillity = true;
    }
  }
  if (operatorStack.length === 0) {
    return valueOf(varStack.pop());
  }
  while (operatorStack.length > 0) {
    operate(operatorStack.pop());
  }
  return varStack.pop();
}

export function generateTruthTable(variables, f) {
  let tt = [];
  for (let i = 0; i < Math.pow(2, variables.length); i++) {
    let combination = i.toString(2).padStart(variables.length, "0");
    let states = {};
    for (let j = 0; j < variables.length; j++) {
      states[variables[j]] = combination[j] === "1";
    }
    tt.push(calculateValue(f, states));
  }
  return tt;
}

export function compareExpressions(exp1, exp2) {
  const variables1 = Array.from(
    new Set(exp1.match(/[A-Z][a-z]*[0-9]*[a-z]*/g))
  );
  const variables2 = Array.from(
    new Set(exp2.match(/[A-Z][a-z]*[0-9]*[a-z]*/g))
  );
  const variables = Array.from(new Set([...variables1, ...variables2])).sort();

  const tt1 = generateTruthTable(variables, exp1);
  const tt2 = generateTruthTable(variables, exp2);
  if (tt1.length !== tt2.length) return false;
  else {
    return tt1.every((value, index) => value == tt2[index]);
  }
}

export function getMinterms(exp) {
  let minterms = [];
  exp.split(" + ").forEach((term) => {
    let val = "";
    for (const lit of term) {
      if (lit.match(/[A-Z]/)) {
        val += "1";
      }
      if (lit === "'") {
        val = val.slice(0, val.length - 1) + "0";
      }
    }
    minterms.push(parseInt(val, 2));
  });
  return minterms;
}

function qmAlgorithm_v1(size, minterms, dontCares) {
  function toBinaryString(num, size) {
    let binary = "";
    let quotient = num;
    do {
      binary = (quotient % 2) + binary;
      quotient = Math.floor(quotient / 2);
    } while (quotient > 0);
    if (binary.length < size) {
      binary = "0".repeat(size - binary.length) + binary;
    }
    return binary;
  }
  function combineImplicants(implicants1, implicants2, lastImplicant = false) {
    if (implicants1 && !implicants2) return [[], implicants1];
    if (!implicants1) return [[], lastImplicant ? implicants2 : []];
    if (implicants1 && !implicants2.length) return [[], implicants1];
    if (!implicants1.length) return [[], lastImplicant ? implicants2 : []];
    const combinedImplicants = new Set();
    const essentialPrimeImplicants = new Set();
    for (let j = 0; j < implicants1.length; j++) {
      let imp1 = implicants1[j];
      let isEssential = true;
      for (let k = 0; k < implicants2.length; k++) {
        let imp2 = implicants2[k];
        const combined = combineTwoImplicants(imp1, imp2);
        if (combined.length) {
          combinedImplicants.add(combined);
          isEssential = false;
        } else if (lastImplicant) {
          essentialPrimeImplicants.add(imp2);
        }
      }
      if (isEssential) {
        essentialPrimeImplicants.add(imp1);
      }
    }
    return [
      Array.from(combinedImplicants),
      Array.from(essentialPrimeImplicants),
    ];
  }

  function combineTwoImplicants(imp1, imp2) {
    let diffCount = 0;
    let combinedTerm = "";
    for (let i = 0; i < imp1.length; i++) {
      if (imp1[i] !== imp2[i]) {
        diffCount++;
        if (diffCount > 1) {
          return [];
        }
        combinedTerm += "-";
      } else {
        combinedTerm += imp1[i];
      }
    }
    return diffCount === 1 ? combinedTerm : []; // Only 1 differing bit allowed
  }

  function groupBySetCount(...terms) {
    let setCount = 0;
    let groups = [[]];
    for (const t of terms) {
      for (const term of t) {
        const matches = term.match(/1/g);
        setCount = matches ? matches.length : 0;
        if (groups[setCount] === undefined) {
          groups[setCount] = [];
        }
        groups[setCount].push(term);
      }
    }
    return groups;
  }

  function isCovered(implicant, binTerm) {
    // const binTerm = toBinaryString(term, size);
    for (let i = 0; i < implicant.length; i++) {
      if (implicant[i] !== "-" && implicant[i] !== binTerm[i]) {
        return false;
      }
    }
    return true;
  }

  function makeChart(implicants, minterms) {
    if (minterms.length === 0) {
      return null;
    }
    const chart = new Map();
    const count = Array.from(minterms.map((el) => 0));
    for (const imp of implicants) {
      const row = minterms.map((el) => isCovered(imp, el));
      chart.set(imp, row.concat(row.filter(Boolean).length));
    }
    chart.forEach((val, key) => {
      for (let i = 0; i < val.length - 1; i++) {
        if (val[i]) count[i]++;
      }
    });
    chart.set("STATISTICS", count);
    return chart;
  }

  function eliminateRedundancies(implicants, minterms) {
    const chart = makeChart(implicants, minterms);
    if (!chart) {
      return [];
    }
    const isMinStatTrue = (states, stats, min) => {
      for (let i = 0; i < stats.length; i++) {
        if (states[i] && stats[i] === min) return true;
      }
      return false;
    };
    let EPIs = [];
    const STATISTICS = chart.get("STATISTICS");
    const minCount = Math.min(...STATISTICS);
    let uncoveredMinterms = [];
    let EPI = "";
    let maxTrueCount = -1;
    for (const mapItr = chart.entries(); mapItr; ) {
      const mapItrNext = mapItr.next();
      if (!mapItrNext.value) {
        break;
      }
      const [key, val] = mapItrNext.value;
      if (key !== "STATISTICS") {
        if (
          isMinStatTrue(val, STATISTICS, minCount) &&
          val[val.length - 1] > maxTrueCount
        ) {
          maxTrueCount = val[val.length - 1];
          EPI = key;
          uncoveredMinterms = val;
        }
      }
    }
    EPIs.push(EPI);
    // console.log("uncoveredMinterms:", uncoveredMinterms);
    // chart.forEach((val, key) => {
    //   if(key !== 'STATISTICS' && val[minCount]) {
    //     EPIs.push(key);
    //     uncoveredMinterms = val;
    //     console.log(key, uncoveredMinterms, EPIs, '\n');
    //   }
    // });
    uncoveredMinterms = minterms.filter((el, i) => !uncoveredMinterms[i]);
    const newEPIs = eliminateRedundancies(implicants, uncoveredMinterms);
    if (newEPIs.length) {
      EPIs = EPIs.concat(newEPIs);
    }
    return EPIs;
  }
  function arraysAreEqual(arr1, arr2) {
    if (!arr1 || !arr2) return false;
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  }
  const binaryMinterms = minterms.sort().map((el) => toBinaryString(el, size));
  const binaryDontCares = dontCares
    .sort()
    .map((el) => toBinaryString(el, size));
  const implicants = [];
  const essentialPrimeImplicants = [];
  let indexImplicants = 0;
  implicants[0] = groupBySetCount(binaryMinterms, binaryDontCares);
  let keepGrouping = implicants[indexImplicants].length > 0;
  let previousImplicants = [];
  while (keepGrouping && implicants[indexImplicants].length > 0) {
    let newImplicants = [];
    let newEssentialPrimeImplicants = [];
    keepGrouping = false;
    for (let i = 0; i < implicants[indexImplicants].length - 1; i++) {
      const combined = combineImplicants(
        implicants[indexImplicants][i],
        implicants[indexImplicants][i + 1],
        i === implicants[indexImplicants].length - 2
      );
      if (combined[0].flat().length || combined[1].flat().length) {
        keepGrouping = true;
        if (combined[0].length) newImplicants.push(combined[0]);
        if (combined[1].length) newEssentialPrimeImplicants.push(combined[1]);
      }
    }
    // if (
    //   !(
    //     implicants[indexImplicants][implicants[indexImplicants].length - 1] in
    //       newImplicants.flat() ||
    //     implicants[indexImplicants][implicants[indexImplicants].length - 1] in
    //       newEssentialPrimeImplicants.flat()
    //   )
    // )
    // essentialPrimeImplicants.push(
    //   implicants[indexImplicants][implicants[indexImplicants].length - 1]
    // );
    if (newEssentialPrimeImplicants.length) {
      essentialPrimeImplicants.push(...newEssentialPrimeImplicants);
    }

    if (newImplicants.length) {
      implicants.push(newImplicants);
      indexImplicants++;
    }
    if (arraysAreEqual(previousImplicants, newImplicants.flat())) {
      keepGrouping = false;
    }
    previousImplicants = newImplicants.flat();
  }
  return eliminateRedundancies(
    implicants[indexImplicants].flat().concat(...essentialPrimeImplicants),
    binaryMinterms
  );
}

function qmAlgorithm(size, minterms, dontCares) {
  const binaryMinterms = minterms.sort().map((el) => toBinaryString(el, size));
  const binaryDontCares = dontCares
    .sort()
    .map((el) => toBinaryString(el, size));
  let implicants = [];
  const consideredImplicants = new Set();
  const usedImplicants = new Set();
  for (
    implicants = groupBySetCount(binaryMinterms, binaryDontCares);
    implicants.length > 1;

  ) {
    const newImplicants = [];
    for (let i = 0; i <= implicants.length - 2; i++) {
      const combinedTerm = combineImplicants(implicants[i], implicants[i + 1]);
      if (combinedTerm[1].length) {
        for (const term of combinedTerm[1]) usedImplicants.add(term);
      }
      for (const term of implicants.flat(2)) consideredImplicants.add(term);
      if (combinedTerm[0].length) newImplicants.push(combinedTerm[0]);
    }
    implicants = newImplicants;
  }
  if (implicants.length)
    for (const term of implicants.flat()) consideredImplicants.add(term);
  const essentialPrimeImplicants = setDifference(
    consideredImplicants,
    usedImplicants
  );
  return eliminateRedundancies(
    Array.from(essentialPrimeImplicants),
    binaryMinterms
  );

  function setDifference(set1, set2) {
    return new Set([...set1].filter((x) => !set2.has(x)));
  }
  function toBinaryString(num, size) {
    let binary = "";
    let quotient = num;
    do {
      binary = (quotient % 2) + binary;
      quotient = Math.floor(quotient / 2);
    } while (quotient > 0);
    if (binary.length < size) {
      binary = "0".repeat(size - binary.length) + binary;
    }
    return binary;
  }
  function groupBySetCount(...terms) {
    let setCount = 0;
    let groups = [[]];
    for (const t of terms) {
      for (const term of t) {
        const matches = term.match(/1/g);
        setCount = matches ? matches.length : 0;
        if (groups[setCount] === undefined) {
          groups[setCount] = [];
        }
        groups[setCount].push(term);
      }
    }
    return groups;
  }
  function arraysAreEqual(arr1, arr2) {
    if (!arr1 || !arr2) return false;
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  }
  function isCovered(implicant, binTerm) {
    for (let i = 0; i < implicant.length; i++) {
      if (implicant[i] !== "-" && implicant[i] !== binTerm[i]) {
        return false;
      }
    }
    return true;
  }

  function makeChart(implicants, minterms) {
    if (minterms.length === 0) {
      return null;
    }
    const chart = new Map();
    const count = Array.from(minterms.map((el) => 0));
    for (const imp of implicants) {
      const row = minterms.map((el) => isCovered(imp, el));
      chart.set(imp, row.concat(row.filter(Boolean).length));
    }
    chart.forEach((val, key) => {
      for (let i = 0; i < val.length - 1; i++) {
        if (val[i]) count[i]++;
      }
    });
    chart.set("STATISTICS", count);
    return chart;
  }

  function eliminateRedundancies(implicants, minterms) {
    const chart = makeChart(implicants, minterms);
    if (!chart) {
      return [];
    }
    const isMinStatTrue = (states, stats, min) => {
      for (let i = 0; i < stats.length; i++) {
        if (states[i] && stats[i] === min) return true;
      }
      return false;
    };
    let EPIs = [];
    const STATISTICS = chart.get("STATISTICS");
    const minCount = Math.min(...STATISTICS);
    let uncoveredMinterms = [];
    let EPI = "";
    let maxTrueCount = -1;
    for (const mapItr = chart.entries(); mapItr; ) {
      const mapItrNext = mapItr.next();
      if (!mapItrNext.value) {
        break;
      }
      const [key, val] = mapItrNext.value;
      if (key !== "STATISTICS") {
        if (
          isMinStatTrue(val, STATISTICS, minCount) &&
          val[val.length - 1] > maxTrueCount
        ) {
          maxTrueCount = val[val.length - 1];
          EPI = key;
          uncoveredMinterms = val;
        }
      }
    }
    EPIs.push(EPI);
    uncoveredMinterms = minterms.filter((el, i) => !uncoveredMinterms[i]);
    const newEPIs = eliminateRedundancies(implicants, uncoveredMinterms);
    if (newEPIs.length) {
      EPIs = EPIs.concat(newEPIs);
    }
    return EPIs;
  }
  function combineImplicants(implicants1, implicants2) {
    if (
      !implicants1 ||
      !implicants1.length ||
      (implicants1 && !implicants2) ||
      (implicants1 && !implicants2.length)
    )
      return [[], []];
    const combinedImplicants = new Set();
    const usedImplicants = new Set();
    for (let j = 0; j < implicants1.length; j++) {
      let imp1 = implicants1[j];
      for (let k = 0; k < implicants2.length; k++) {
        let imp2 = implicants2[k];
        const combined = combineTwoImplicants(imp1, imp2);
        if (combined.length) {
          combinedImplicants.add(combined);
          usedImplicants.add(imp1);
          usedImplicants.add(imp2);
        }
      }
    }
    return [Array.from(combinedImplicants), Array.from(usedImplicants)];
  }

  function combineTwoImplicants(imp1, imp2) {
    let diffCount = 0;
    let combinedTerm = "";
    for (let i = 0; i < imp1.length; i++) {
      if (imp1[i] !== imp2[i]) {
        diffCount++;
        if (diffCount > 1) {
          return [];
        }
        combinedTerm += "-";
      } else {
        combinedTerm += imp1[i];
      }
    }
    return diffCount === 1 ? combinedTerm : [];
  }
}

export function mintermsFromQMAlgorithm(
  size,
  minterms,
  dontCares,
  allowedVars = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ],
  maxterm = false
) {
  const terms = qmAlgorithm(size, minterms, dontCares);
  let exp = "";
  if (maxterm) {
    for (const term of terms) {
      let parsedTerm = "";
      for (let i = 0; i < term.length; i++)
        if (term[i] === "0") {
          parsedTerm =
            parsedTerm +
            (parsedTerm.length === 0 ? "" : "+") +
            (size <= 26 ? allowedVars[i] : `${i}`);
        } else if (term[i] === "1") {
          parsedTerm =
            parsedTerm +
            (parsedTerm.length === 0 ? "" : "+") +
            ((size <= 26 ? allowedVars[i] : `${i}`) + "'");
        }
      if (parsedTerm) exp = exp + "(" + parsedTerm + ")";
    }
    return exp;
  } else {
    for (const term of terms) {
      let parsedTerm = "";
      for (let i = 0; i < term.length; i++)
        if (term[i] === "0") {
          parsedTerm += (size <= 26 ? allowedVars[i] : `${i}`) + "'";
        } else if (term[i] === "1") {
          parsedTerm += size <= 26 ? allowedVars[i] : `${i}`;
        }
      if (parsedTerm) exp += parsedTerm + " + ";
    }
    if (exp[exp.length - 2] === "+") return exp.slice(0, exp.length - 3);
  }
}

export function maxToMinTerms(size, maxterms) {
  const minterms = [];
  for (let i = 0; i < Math.pow(2, size); i++) {
    if (!(i in maxterms)) minterms.push(i);
  }
  return minterms;
}

export function KMapGroup(size, minterms, dontCares) {
  const qmGroups = qmAlgorithm(size, minterms, dontCares);
  const KMapGroups = [];
  let combinations = [];
  const generateCombinations = (pattern, combination, index) => {
    if (index === pattern.length) {
      combinations.push(combination);
      return;
    }
    if (pattern[index] === "-") {
      combination += "0";
      generateCombinations(pattern, combination, index + 1);
      combination = combination.slice(0, combination.length - 1);
      combination += "1";
      generateCombinations(pattern, combination, index + 1);
    } else if (pattern[index] === "0") {
      combination += "0";
      generateCombinations(pattern, combination, index + 1);
    } else if (pattern[index] === "1") {
      combination += "1";
      generateCombinations(pattern, combination, index + 1);
    }
  };
  for (const group of qmGroups) {
    generateCombinations(group, "", 0);
    KMapGroups.push(combinations.map((x) => parseInt(x, 2)));
    combinations = [];
  }
  return KMapGroups;
}
