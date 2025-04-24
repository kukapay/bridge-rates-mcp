const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const { createConfig, getRoutes, ChainType, getChains, getTools, getTokens } = require("@lifi/sdk");

// Initialize LiFi SDK
const lifi = createConfig({
  integrator: "bridge-rates-mcp",
});

// Create MCP server
const server = new McpServer({
  name: "bridge-rates-mcp",
  version: "1.0.0",
});

// Tool 1: Get cross-chain bridge rates
server.tool(
  "getBridgeRates",
  "Fetches the cross-chain bridge rate for a token pair between two chains",
  {
    fromChainId: z.string().describe("Source chain ID (e.g., '1' for Ethereum)"),
    toChainId: z.string().describe("Destination chain ID (e.g., '10' for Optimism)"),
    fromTokenAddress: z.string().describe("Source token contract address"),
    toTokenAddress: z.string().describe("Destination token contract address"),
    fromAmount: z.string().default("10000000").describe("Amount to bridge (in smallest token unit, default: 10000000)"),
  },
  async ({ fromChainId, toChainId, fromTokenAddress, toTokenAddress, fromAmount }) => {
    try {
      const quote = await getRoutes({
        fromChainId: parseInt(fromChainId),
        toChainId: parseInt(toChainId),
        fromTokenAddress,
        toTokenAddress,
        fromAmount,
      });

      if (!quote.routes || quote.routes.length === 0) {
        throw new Error("No valid routes found");
      }

      // Format routes into a Markdown table
      let markdownTable = "| From Amount | From Amount USD | To Amount | To Amount USD | To Amount Min | Gas Cost USD | Providers | Tags |\n";
      markdownTable += "|-------------|-----------------|-----------|---------------|---------------|--------------|-------|------|\n";
      quote.routes.forEach((route) => {
        const tools = route.steps.map((step) => step.tool).join(", ");
        const gasCostUSD = route.steps.reduce((total, step) => {
          const stepGasCost = step.estimate?.gasCosts?.reduce((sum, cost) => sum + parseFloat(cost.amountUSD || "0"), 0) || 0;
          return total + stepGasCost;
        }, 0).toFixed(4);
        const tags = route.tags?.join(", ") || "None";
        markdownTable += `| ${route.fromAmount} | ${route.fromAmountUSD} | ${route.toAmount} | ${route.toAmountUSD} | ${route.toAmountMin} | ${gasCostUSD} | ${tools} | ${tags} |\n`;
      });

      return {
        content: [
          {
            type: "text",
            text: markdownTable,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching bridge rate: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Tool 2: Get supported chains
server.tool(
  "getSupportedChains",
  "Fetches the list of chains supported by LiFi for cross-chain bridging",
  {},
  async () => {
    try {
      const chains = await getChains(lifi, { chainTypes:  [ChainType.EVM, ChainType.SVM] });

      // Format and sort chains
      const formattedChains = chains.map((chain) => ({
        chainType: chain.chainType,
        id: chain.id,
        key: chain.key,
        name: chain.name,
        nativeToken: chain.nativeToken?.symbol || "Unknown",
      })).sort((a, b) => {
        if (a.chainType !== b.chainType) return a.chainType.localeCompare(b.chainType);
        if (a.id !== b.id) return a.id - b.id;
        if (a.key !== b.key) return a.key.localeCompare(b.key);
        if (a.name !== b.name) return a.name.localeCompare(b.name);
        return a.nativeToken.localeCompare(b.nativeToken);
      });

      // Create Markdown table
      let markdownTable = "| Chain Type | ID | Key | Name | Native Token |\n";
      markdownTable += "|------------|----|-----|------|--------------|\n";
      formattedChains.forEach((chain) => {
        markdownTable += `| ${chain.chainType} | ${chain.id} | ${chain.key} | ${chain.name} | ${chain.nativeToken} |\n`;
      });

      return {
        content: [
          {
            type: "text",
            text: markdownTable,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching supported chains: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Tool 3: Get supported bridges
server.tool(
  "getSupportedBridges",
  "Fetches the list of bridges supported by LiFi for cross-chain bridging",
  {},
  async () => {
    try {
      const tools = await getTools();
      
      const bridges = tools.bridges.map(bridge => ({key: bridge.key, name: bridge.name, type: "BRIDGE"}))
              .concat(tools.exchanges.map(exchange => ({key: exchange.key, name: exchange.name, type: "EXCHANGE"})));

      // Format and sort bridges
      const formattedBridges = bridges.sort((a, b) => {
        if(a.type !== b.type) return a.type.localeCompare(b.type);
        return a.name.localeCompare(b.name);
      });

      // Create Markdown table
      let markdownTable = "| Key | Name |  Type |\n";
      markdownTable += "|-------------|--------------|-----------|\n";
      formattedBridges.forEach((bridge) => {
        markdownTable += `| ${bridge.key} | ${bridge.name} |  ${bridge.type} |\n`;
      });

      return {
        content: [
          {
            type: "text",
            text: markdownTable,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching supported bridges: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);


// Main function to start the server with stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  //console.log(await server._registeredTools['getSupportedChains'].callback({})  )
  //console.log(await server._registeredTools['getSupportedBridges'].callback() )
  //console.log(await server._registeredTools['getBridgeRates'].callback({fromChainId: 1, toChainId: 10, fromTokenAddress: "0x0000000000000000000000000000000000000000", toTokenAddress: "0x0000000000000000000000000000000000000000", fromAmount: "1000000000" }))
}

main().catch(console.error);