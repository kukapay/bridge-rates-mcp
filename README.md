# Bridge Rates MCP Server

An MCP server that delivers real-time cross-chain bridge rates and optimal transfer routes to support decision-making by onchain AI agents.

[![Discord](https://img.shields.io/discord/1353556181251133481?cacheSeconds=3600)](https://discord.gg/aRnuu2eJ)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)
![Status](https://img.shields.io/badge/status-active-brightgreen.svg)

## Features

- **Get Bridge Rates**: Retrieve cross-chain bridge rates for token pairs, including USD values, gas costs, route providers and tags, presented in a Markdown table.
- **List Supported Chains**: Fetch a sorted list of blockchain networks supported by LI.FI.
- **List Supported Bridges**: Obtain a sorted list of bridges and exchanges available for cross-chain transfers.

## Prerequisites

- **Node.js**: Version 18 or higher.
- **npm**: For dependency management.
- **MCP Client**: An MCP-compatible client (e.g., Claude Desktop) to interact with the server.

## Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/kukapay/bridge-rates-mcp.git
   cd bridge-rates-mcp
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Integrate with an MCP Client**:
   Configure your MCP client (e.g., Claude Desktop) to connect to the server. For Claude Desktop, edit the configuration file (e.g., `~/Library/Application Support/Claude/claude_desktop_config.json` on Mac or `%APPDATA%\Claude\claude_desktop_config.json` on Windows):
   ```json
   {
     "mcpServers": {
       "bridge-rates": {
         "command": "node",
         "args": ["/absolute/path/to/bridge-rates-mcp/index.js"]
       }
     }
   }
   ```
   Restart Claude Desktop and verify the tools are available (look for the hammer icon).

## Tools

### 1. `getBridgeRates`
Fetches cross-chain bridge rates for a token pair between two chains, returning all available routes in a Markdown table.

**Parameters**:
- `fromChainId` (string, required): Source chain ID (e.g., "1" for Ethereum).
- `toChainId` (string, required): Destination chain ID (e.g., "10" for Optimism).
- `fromTokenAddress` (string, required): Source token contract address.
- `toTokenAddress` (string, required): Destination token contract address.
- `fromAmount` (string, optional): Amount to bridge in the smallest token unit (default: "10000000").

**Example Prompt**:
```
What's the bridge rate from Arbitrum USDC to Optimism DAI?
```

**Example Output**:
```
| From Amount | From Amount USD | To Amount | To Amount USD | To Amount Min | Gas Cost USD | Providers | Tags                 |
|-------------|-----------------|-----------|---------------|---------------|--------------|-----------|----------------------|
| 10000000    | 10.00           | 9980000   | 9.98          | 9940000       | 0.2300       | hop       | RECOMMENDED,CHEAPEST |
| 10000000    | 10.00           | 9975000   | 9.97          | 9935000       | 0.2500       | connext   | None                 |
```

### 2. `getSupportedChains`
Fetches a sorted list of chains supported by LI.FI for cross-chain bridging, presented in a Markdown table.

**Parameters**: None.

**Example Prompt**:
```
List all supported chains for bridging.
```

**Example Output**:
```
| Chain Type | ID | Key | Name          | Native Token |
|------------|----|-----|---------------|--------------|
| EVM        | 1  | eth | Ethereum      | ETH          |
| EVM        | 10 | opt | Optimism      | ETH          |
| EVM        | 137| pol | Polygon       | MATIC        |
| SVM        | 101| sol | Solana        | SOL          |
```

### 3. `getSupportedBridges`
Fetches a sorted list of bridges and exchanges supported by LI.FI, presented in a Markdown table.

**Parameters**: None.

**Example Prompt**:
```
List all supported bridges for cross-chain bridging.
```

**Example Output**:
```
| Key           | Name                | Type     |
|---------------|---------------------|----------|
| across        | Across              | BRIDGE   |
| connext       | Connext             | BRIDGE   |
| hop           | Hop Protocol        | BRIDGE   |
| sushiswap     | SushiSwap           | EXCHANGE |
| uniswap       | Uniswap             | EXCHANGE |
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
