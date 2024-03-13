import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/navbar/navbar";
import Home from "./components/home/home";
import Calculator from "./components/calculator/calculator";
import Comparator from "./components/comparator/comparator";
import Tt from "./components/tt/tt";
import Simplifier from "./components/simplifier/simplifier";
import About from "./components/about/about";
import Kmap from "./components/kmap/kmap";

function App() {
  const showMobileView = window.matchMedia("(max-width: 49.5em)").matches;
  return (
    <div className="App">
      <Navbar showMobileView={showMobileView} />
      <Routes>
        <Route path="/" element={<Home showMobileView={showMobileView} />} />
        <Route
          path="/calculator"
          element={<Calculator showMobileView={showMobileView} />}
        />
        <Route
          path="/comparator"
          element={<Comparator showMobileView={showMobileView} />}
        />
        <Route path="/tt" element={<Tt showMobileView={showMobileView} />} />
        <Route
          path="/kmap"
          element={<Kmap showMobileView={showMobileView} />}
        />
        <Route
          path="/simplifier"
          element={<Simplifier showMobileView={showMobileView} />}
        />
        <Route
          path="/about"
          element={<About showMobileView={showMobileView} />}
        />
      </Routes>
    </div>
  );
}

export default App;
