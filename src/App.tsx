import {APITester} from "./APITester";
import "./index.css";

import tradeLogo from "./trade-logo.svg";
import {MarketDashboard} from "./MarketDashboard";

export function App() {
  return (
    <div className="app">
      <div className="logo-container">
        <img src={tradeLogo} alt="Trade Logo" className="logo trade-logo"/>
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