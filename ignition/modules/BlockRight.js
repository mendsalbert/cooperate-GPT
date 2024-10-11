const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

// Default values
const DEFAULT_CONTENT_HASH = "QmDefaultContentHash";
const DEFAULT_METADATA_URI = "https://example.com/metadata/default";
const DEFAULT_IS_COMMERCIAL = true;
const DEFAULT_PRICE = 100000000000000000n; // 0.1 ETH in wei

module.exports = buildModule("BlockRightModule", (m) => {
  // Parameters that can be overridden during deployment
  const initialContentHash = m.getParameter(
    "initialContentHash",
    DEFAULT_CONTENT_HASH
  );
  const initialMetadataURI = m.getParameter(
    "initialMetadataURI",
    DEFAULT_METADATA_URI
  );
  const isCommercial = m.getParameter("isCommercial", DEFAULT_IS_COMMERCIAL);
  const price = m.getParameter("price", DEFAULT_PRICE);

  // Deploy the BlockRight contract
  const blockRight = m.contract("BlockRight");

  // Register initial content after deployment
  m.call(blockRight, "registerContent", [
    initialContentHash,
    initialMetadataURI,
    isCommercial,
    price,
  ]);

  return { blockRight };
});
