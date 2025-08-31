import {APITester} from "./APITester";
import "./index.css";

import logo from "./logo.svg";
import reactLogo from "./react.svg";
import {MarketDashboard} from "./MarketDashboard";

export function App() {
  return (
    <div className="app">
      <div className="logo-container">
        <img src={logo} alt="Bun Logo" className="logo bun-logo"/>
        <img src={reactLogo} alt="React Logo" className="logo react-logo"/>
      </div>

      <h1>Trading Dashboard</h1>
      <p>Select an instrument to view its historical prices, trade controls, and related news.</p>

      <MarketDashboard/>

      <h2 style={{marginTop: 32}}>API Tester</h2>
      <APITester/>
    </div>
  );
}

export default App;