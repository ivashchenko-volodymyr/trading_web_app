import React, { useState } from "react";

export enum TradeType {
  BUY = "buy",
  SELL = "sell",
}

export function TradeButton({ tradeType, symbol }: { tradeType: TradeType; symbol: string }) {
  const [toast, setToast] = useState<string | null>(null);

  const handleBuy = () => {
    setToast(`Buying ${symbol}... To invest in portal development please contact: vladimir.v.iv\@gmail.com`);
    setTimeout(() => setToast(null), 20000); // auto-hide after 20 seconds
  };

  const handleSell = () => {
    setToast(`Selling ${symbol}... To invest in portal development please contact: vladimir.v.iv\@gmail.com`);
    setTimeout(() => setToast(null), 3000);
  };

  let buttonLabel = "";
  let buttonClass = "";
  let onClickHandler: () => void;

  switch (tradeType) {
    case TradeType.BUY:
      buttonLabel = "Buy";
      buttonClass="btn buy"
      onClickHandler = handleBuy;
      break;
    case TradeType.SELL:
      buttonLabel = "Sell";
      buttonClass="btn sell"
      onClickHandler = handleSell;
      break;
    default:
      buttonLabel = "Buy";
      buttonClass="btn buy"
      onClickHandler = handleBuy;
  }

  return (
    <>
      <button className={buttonClass} onClick={onClickHandler}>{buttonLabel}</button>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: 16,
            right: 16,
            background: "#333",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: 6,
          }}
        >
          {toast}
        </div>
      )}
    </>
  );
}