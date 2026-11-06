import { FetchOptions, SimpleAdapter } from "../../adapters/types";
import { CHAIN } from "../../helpers/chains";

// KONAggregator on Arc Mainnet, deployed 2026-09-28 (block 23188803).
// https://explorer.arc.io/address/0xf4afd2d3e978b61d682793cce481e20821bea502
const KON_AGGREGATOR = "0xf4afd2d3e978b61d682793cce481e20821bea502";

// Emitted once per filled swap; a reverted swap emits nothing.
const QUOTE_EXECUTED =
  "event QuoteExecuted(address indexed sender, address indexed recipient, bytes16 indexed quoteId, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut, uint256 feeAmount, uint256 amountOutMin, uint256 amountOutExpected)";

const fetch = async (options: FetchOptions) => {
  const dailyVolume = options.createBalances();
  const logs = await options.getLogs({ target: KON_AGGREGATOR, eventAbi: QUOTE_EXECUTED });

  logs.forEach((log) => {
    dailyVolume.add(log.tokenIn, log.amountIn);
  });

  return { dailyVolume };
};

const methodology = {
  Volume: "Sum of amountIn of every swap routed through the KONAggregator contract on Arc, read from its QuoteExecuted events.",
};

const adapter: SimpleAdapter = {
  version: 2,
  pullHourly: true,
  fetch,
  chains: [CHAIN.ARC],
  start: "2026-09-28",
  methodology,
};

export default adapter;
