import { db } from "./dbConfig";
import {
  users,
  contents,
  licenses,
  usageRecords,
  payments,
  aiOutputs,
} from "./schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { ethers } from "ethers";
import BlockRightABI from "../BlockRight.json";
import { parseEther } from "ethers";
import { sha256 } from "js-sha256";

// Initialize ethers provider and contract
const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);

const contract = new ethers.Contract(
  "0xE3705927c585e58BBd0F29d2a02E5d158C679832",
  BlockRightABI.abi,
  provider
);

// Add this function to fetch the current ETH to USD exchange rate
async function getEthToUsdRate() {
  const response = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
  );
  const data = await response.json();
  return data.ethereum.usd;
}

// User Actions
export async function createOrUpdateUser(address: string, email: string) {
  const [user] = await db
    .insert(users)
    .values({ address, email })
    .onConflictDoUpdate({
      target: users.address,
      set: { email, updatedAt: new Date() },
    })
    .returning()
    .execute();
  return user;
}

export async function updateUserProfile(
  userId: number,
  profileData: Partial<typeof users.$inferInsert>
) {
  const [updatedUser] = await db
    .update(users)
    .set({ ...profileData, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning()
    .execute();
  return updatedUser;
}

export async function getUserById(userId: number) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .execute();
  return user;
}

// User Actions
export async function getOrCreateUser(email: string, address?: string) {
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .execute();

  if (existingUser.length > 0) {
    // Update the user's address if provided
    if (address && existingUser[0].address !== address) {
      const [updatedUser] = await db
        .update(users)
        .set({ address, updatedAt: new Date() })
        .where(eq(users.email, email))
        .returning()
        .execute();
      return updatedUser;
    }
    return existingUser[0];
  }

  // Create a new user if not found
  const [newUser] = await db
    .insert(users)
    .values({
      email,
      address: address || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning()
    .execute();

  return newUser;
}

// Content Actions
export async function registerContent(
  userEmail: string,
  title: string,
  contentType: string,
  contentHash: string,
  ipfsUrl: string,
  isCommercial: boolean,
  price: number,
  licenseId: number // Add this parameter
) {
  // Get or create the user
  const user = await getOrCreateUser(userEmail);
  console.log(user);

  // Register content in the database
  const [dbContent] = await db
    .insert(contents)
    .values({
      userId: user.id,
      title,
      contentType,
      contentHash,
      ipfsUrl,
      price: price.toString(),
      licenseId, // Add this line
    })
    .returning()
    .execute();

  // Log environment variables
  console.log("Environment variables:", {
    ETHEREUM_RPC_URL: process.env.ETHEREUM_RPC_URL,
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
    PRIVATE_KEY: process.env.PRIVATE_KEY ? "[REDACTED]" : "Not set",
  });

  // Register content on blockchain
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("Private key is not set in environment variables");
  }
  const signer = new ethers.Wallet(privateKey, provider);
  const contractWithSigner = contract.connect(signer);

  // Check if registerContent method exists on the contract
  if (typeof contractWithSigner.registerContent !== "function") {
    throw new Error("registerContent method does not exist on the contract");
  }

  const tx = await contractWithSigner.registerContent(
    contentHash,
    ipfsUrl,
    isCommercial,
    parseEther(price.toString())
  );
  const receipt = await tx.wait();

  // Get the tokenId from the event
  const event = receipt.logs.find(
    (log: any) => log.eventName === "ContentRegistered"
  );
  const tokenId = event?.args?.tokenId;

  // Update the database record with the tokenId
  if (tokenId) {
    await db
      .update(contents)
      .set({ tokenId: tokenId.toString() })
      .where(eq(contents.id, dbContent.id))
      .execute();
  }

  return { ...dbContent, tokenId };
}

export async function getContentById(contentHash: string) {
  const [content] = await db
    .select()
    .from(contents)
    .where(eq(contents.contentHash, contentHash))
    .limit(1)
    .execute();
  return content;
}

export const getUserContents = async (email: string) => {
  console.log("Getting contents for user email:", email);
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    console.log("User not found for email:", email);
    throw new Error("User not found");
  }
  console.log("Found user:", user);

  const userContents = await db
    .select({
      id: contents.id,
      title: contents.title,
      contentType: contents.contentType,
      price: contents.price,
    })
    .from(contents)
    .where(eq(contents.userId, user.id));

  console.log("User contents:", userContents);
  return userContents;
};

export async function getUserContents_(userEmail: string) {
  const userId = await getUserIdByEmail(userEmail);

  if (!userId) {
    throw new Error("User not found");
  }

  return db
    .select()
    .from(contents)
    .where(eq(contents.userId, userId))
    .execute();
}
// License Actions
export async function createLicense(
  licenseType: any,
  price: any,
  details: any
) {
  const [license] = await db
    .insert(licenses)
    .values({
      type: licenseType,
      details,
      price: price.toString(),
    })
    .returning()
    .execute();
  return license;
}
export async function getLicenses(userEmail: string) {
  console.log("Getting licenses for user email:", userEmail);
  const user = await getOrCreateUser(userEmail);
  const licenses = await db
    .select()
    .from(licenses)
    .where(eq(licenses.userId, user.id))
    .execute();

  console.log("Licenses found:", licenses);
  return licenses;
}

export async function updateLicense(
  licenseId: number,
  updateData: {
    type?: string;
    details?: string;
    price?: string;
  }
) {
  const [updatedLicense] = await db
    .update(licenses)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(licenses.id, licenseId))
    .returning()
    .execute();
  return updatedLicense;
}

export async function deleteLicense(licenseId: number) {
  await db.delete(licenses).where(eq(licenses.id, licenseId)).execute();
}

export async function getLicensesByContentId(contentId: number) {
  console.log("Fetching licenses for content ID:", contentId);
  const fetchedLicenses = await db
    .select({
      id: licenses.id,
      type: licenses.type,
      details: licenses.details,
      price: licenses.price,
    })
    .from(licenses)
    .where(eq(licenses.contentId, contentId))
    .execute();

  console.log("Licenses found for content:", fetchedLicenses);
  return fetchedLicenses;
}

// Usage Record Actions
export async function recordContentUsage(
  contentId: number,
  licenseId: number,
  userId: number,
  aiAppId: string,
  usageType: string
) {
  const [usageRecord] = await db
    .insert(usageRecords)
    .values({
      contentId,
      licenseId,
      userId: userId.toString(),
      aiAppId,
      usageType,
    })
    .returning()
    .execute();
  return usageRecord;
}

export async function getContentUsageHistory(userId: number) {
  console.log("Getting content usage history for user ID:", userId);
  const usages = await db
    .select()
    .from(usageRecords)
    .where(eq(usageRecords.userId, userId.toString()))
    .execute();

  console.log("Usages found:", usages);
  return usages;
}

// Payment Actions
export async function recordPayment(
  contentId: number,
  amount: number,
  currency: string,
  transactionHash: string,
  creatorId: number
) {
  console.log("Recording payment with:", {
    contentId,
    amount,
    currency,
    transactionHash,
    creatorId,
  });

  let amountInUsd: number;

  if (currency.toLowerCase() === "eth") {
    const ethToUsdRate = await getEthToUsdRate();
    amountInUsd = amount * ethToUsdRate;
  } else {
    amountInUsd = amount;
  }

  const [payment] = await db
    .insert(payments)
    .values({
      contentId,
      amount: Math.round(amountInUsd * 100), // Store amount in cents
      currency: "USD", // Always store as USD
      transactionHash,
      status: "completed",
      creatorId,
    })
    .returning()
    .execute();

  console.log("Payment recorded:", payment);
  return payment;
}

export async function getPaymentsByUsageRecord(usageRecordId: number) {
  return db
    .select()
    .from(payments)
    .where(eq(payments.usageRecordId, usageRecordId))
    .execute();
}

// AI Output Actions
export async function recordAIOutput(
  aiAppId: string,
  outputHash: string,
  outputType: string,
  usedContentIds: number[]
) {
  const [aiOutput] = await db
    .insert(aiOutputs)
    .values({ aiAppId, outputHash, outputType, usedContentIds })
    .returning()
    .execute();
  return aiOutput;
}

export async function getAIOutputsByContentId(contentId: number) {
  return db
    .select()
    .from(aiOutputs)
    .where(sql`${aiOutputs.usedContentIds} @> ARRAY[${contentId}]::int[]`)
    .execute();
}
//blockchain interaction
export async function verifyContentOnChain(
  contentId: any,
  contentHash: string
) {
  try {
    const isVerified = await contract.verifyContentHash(contentId, contentHash);
    return isVerified;
  } catch (error) {
    console.error("Error verifying content on chain:", error);
    return false;
  }
}
export async function licenseContentOnChain(contentId: number, userId: number) {
  const content = await getContentById(contentId);
  if (!content) throw new Error("Content not found");

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("Private key is not set in environment variables");
  }
  const signer = new ethers.Wallet(privateKey, provider);
  const contractWithSigner = contract.connect(signer);

  // Check if licenseContent method exists on the contract
  if (typeof contractWithSigner.licenseContent !== "function") {
    throw new Error("licenseContent method does not exist on the contract");
  }

  const tx = await contractWithSigner.licenseContent(content.id, {
    value: parseEther(content.price),
  });
  await tx.wait();

  // Record the license in the database
  await createLicense(contentId, "standard", parseFloat(content.price), "");

  return tx.hash;
}

export async function checkLicenseOnChain(
  contentId: number,
  userAddress: string
) {
  const content = await getContentById(contentId);
  if (!content) throw new Error("Content not found");

  const hasLicense = await contract.hasLicense(content.id, userAddress);
  return hasLicense;
}

export async function saveUserData(email: any, address: string | undefined) {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length === 0) {
      // Insert new user
      await db.insert(users).values({
        email,
        address: address || null,
      } as typeof users.$inferInsert);
    } else {
      // Update existing user
      await db
        .update(users)
        .set({ address: address || null } as typeof users.$inferInsert)
        .where(eq(users.email, email));
    }

    console.log("User data saved successfully");
  } catch (error) {
    console.error("Error saving user data:", error);
  }
}

export async function updateContent(
  contentId: number,
  updateData: {
    title?: string;
    price?: string;
    licenseId?: number; // Change licenseType to licenseId
  }
) {
  const [updatedContent] = await db
    .update(contents)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(contents.id, contentId))
    .returning()
    .execute();

  return updatedContent;
}

export async function getUserIdByEmail(email: string): Promise<number | null> {
  console.log("Getting user ID for email:", email);
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
    .execute();

  console.log("User found:", user);
  return user ? user.id : null;
}

export async function getAllLicenses() {
  const allLicenses = await db.select().from(licenses).execute();

  console.log("All licenses found:", allLicenses);
  return allLicenses;
}

// Update this function to use the payments schema instead of earnings
export async function handleContentPayment(
  contentId: number,
  buyerAddress: string,
  amount: number,
  token_id: any
) {
  const content = await getContentByTokenId(token_id);
  if (!content) throw new Error("Content not found");

  try {
    console.log("Token ID:", token_id);
    console.log("Content:", content);

    // Check if window is defined (we're in the browser)
    if (typeof window === "undefined") {
      throw new Error("This function must be called from the client-side");
    }

    // Request access to the user's accounts
    await (window as any).ethereum.request({ method: "eth_requestAccounts" });

    // Create a Web3Provider using the injected provider (Metamask)
    const provider = new ethers.BrowserProvider((window as any).ethereum);

    // Get the signer (the user's account)
    const signer = await provider.getSigner();

    // Create contract instance with signer
    const contractWithSigner = new ethers.Contract(
      "0xE3705927c585e58BBd0F29d2a02E5d158C679832", // Make sure this is the correct address
      BlockRightABI.abi,
      signer
    );

    const tx = await contractWithSigner.licenseContent(token_id, {
      value: ethers.parseEther(amount.toString()),
    });
    const receipt = await tx.wait();

    // Record the license in the database
    // const license = await createLicense(
    //   buyerAddress,
    //   "standard",
    //   amount.toString(),
    //   content.id
    // );

    // console.log("License created:", license);

    // Record the payment (now in ETH)
    const payment = await recordPayment(
      content.id,
      amount,
      "ETH", // Specify the currency as ETH
      tx.hash,
      content.userId
    );

    console.log("Payment recorded:", payment);

    return {
      success: true,
      transactionHash: tx.hash,
      // licenseId: license.id,
      paymentId: payment.id,
    };
  } catch (error: any) {
    // Change 'error: any' to a more specific type if possible
    console.error("Error processing payment:", error);
    throw new Error(`Payment processing failed: ${error.message}`);
  }
}
// Add this new function to get content by tokenId
export async function getContentByTokenId(tokenId: string) {
  const [content] = await db
    .select()
    .from(contents)
    .where(eq(contents.tokenId, tokenId))
    .limit(1)
    .execute();
  return content;
}

export async function getEarnings(userEmail: string) {
  const user = await getUserByEmail(userEmail);
  if (!user) {
    throw new Error("User not found");
  }

  const earningsData = await db
    .select({
      id: payments.id,
      date: payments.createdAt,
      amount: payments.amount,
      contentType: contents.contentType,
      price: contents.price,
      title: contents.title,
    })
    .from(payments)
    .innerJoin(contents, eq(payments.contentId, contents.id))
    .where(eq(payments.creatorId, user.id))
    .orderBy(desc(payments.createdAt))
    .execute();

  return earningsData.map((earning) => ({
    id: earning.id,
    date: earning.date?.toISOString().split("T")[0] ?? "", // Format date as YYYY-MM-DD, handle null case
    amount: Number(earning.amount) / 100, // Assuming amount is stored in cents
    contentType: earning.contentType,
    price: earning.price, // Assuming price is stored in cents
    title: earning.title,
  }));
}

// Add this helper function to get a user by email
async function getUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
    .execute();
  return user;
}

export async function onboardArtist(
  email: string,
  name: string,
  artistBio: string,
  profileImage: string,
  website: string,
  socialMedia: { twitter: string; instagram: string; facebook: string },
  artistType: string
) {
  try {
    const result = await db
      .update(users)
      .set({
        name,
        artistBio,
        profileImage,
        website,
        socialMedia,
        artistType,
        onboardingCompleted: true,
      })
      .where(eq(users.email, email))
      .returning();

    return result[0];
  } catch (error) {
    console.error("Error onboarding artist:", error);
    throw error;
  }
}

export async function checkArtistOnboarding(email: string): Promise<boolean> {
  try {
    const user = await db
      .select({ onboardingCompleted: users.onboardingCompleted })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
      .execute();

    return user[0]?.onboardingCompleted || false;
  } catch (error) {
    console.error("Error checking artist onboarding status:", error);
    return false;
  }
}

export async function getAllContents() {
  try {
    console.log("Executing getAllContents query...");
    const contentsResult = await db
      .select()
      .from(contents)
      .leftJoin(users, eq(contents.userId, users.id))
      .execute();

    console.log("Raw contents result:", contentsResult);
    console.log("Number of contents fetched:", contentsResult.length);

    // Map the result to match the Content interface
    const mappedContents = contentsResult.map((content) => ({
      id: content.contents.id,
      title: content.contents.title,
      contentType: content.contents.contentType,
      price: content.contents.price,
      contentHash: content.contents.contentHash,
      ipfsUrl: content.contents.ipfsUrl,
      tokenId: content.contents.tokenId,
      createdAt: content.contents.createdAt,
      description: content.contents.description,
      creatorName: content.users?.name,
      creatorEmail: content.users?.email,
      licenseId: content.contents.licenseId,
    }));

    console.log("Mapped contents:", mappedContents);

    return mappedContents;
  } catch (error) {
    console.error("Error in getAllContents:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return [];
  }
}

export async function getVerifiedContentIds(
  userEmail: string
): Promise<number[]> {
  try {
    const userId = await getUserIdByEmail(userEmail);
    if (!userId) {
      console.error("User not found for email:", userEmail);
      return [];
    }

    const verifiedContents = await db
      .select({
        contentId: payments.contentId,
      })
      .from(payments)
      .where(eq(payments.creatorId, userId))
      .execute();

    console.log("Verified contents from payments:", verifiedContents);
    return verifiedContents
      .map((record) => record.contentId)
      .filter((id): id is number => id !== null);
  } catch (error) {
    console.error("Error fetching verified content IDs:", error);
    return [];
  }
}

export async function getDashboardMetrics(userEmail: string) {
  const user = await getUserByEmail(userEmail);
  if (!user) throw new Error("User not found");

  const totalEarnings = await db
    .select({ total: sql<number>`COALESCE(sum(amount) / 100, 0)` })
    .from(payments)
    .where(eq(payments.creatorId, user.id))
    .execute();

  const registeredContent = await db
    .select({ count: sql<number>`count(*)` })
    .from(contents)
    .where(eq(contents.userId, user.id))
    .execute();

  const aiUsage = await db
    .select({ count: sql<number>`count(*)` })
    .from(usageRecords)
    .where(eq(usageRecords.userId, user.id.toString()))
    .execute();

  const recentContents = await db
    .select({
      id: contents.id,
      title: contents.title,
      contentType: contents.contentType,
      price: contents.price,
      createdAt: contents.createdAt,
    })
    .from(contents)
    .where(eq(contents.userId, user.id))
    .orderBy(desc(contents.createdAt))
    .limit(5)
    .execute();

  const recentActivity = await db
    .select({
      id: usageRecords.id,
      contentId: usageRecords.contentId,
      usageType: usageRecords.usageType,
      usageDate: usageRecords.usageDate,
    })
    .from(usageRecords)
    .where(eq(usageRecords.userId, user.id.toString()))
    .orderBy(desc(usageRecords.usageDate))
    .limit(5)
    .execute();

  const aiUsageTracking = await db
    .select({
      id: usageRecords.id,
      aiAppId: usageRecords.aiAppId,
      usageType: usageRecords.usageType,
      contentId: usageRecords.contentId,
    })
    .from(usageRecords)
    .where(eq(usageRecords.userId, user.id.toString()))
    .orderBy(desc(usageRecords.usageDate))
    .limit(5)
    .execute();

  const monthlyEarnings = await db
    .select({
      month: sql<string>`to_char(created_at, 'Mon')`,
      earnings: sql<number>`sum(amount) / 100`,
    })
    .from(payments)
    .where(eq(payments.creatorId, user.id))
    .groupBy(sql`to_char(created_at, 'Mon')`)
    .orderBy(sql`to_char(created_at, 'Mon')`)
    .execute();

  return {
    totalEarnings: Number(totalEarnings[0]?.total) || 0,
    registeredContent: registeredContent[0]?.count || 0,
    aiUsage: aiUsage[0]?.count || 0,
    recentContents,
    recentActivity,
    aiUsageTracking,
    monthlyEarnings,
  };
}

export async function getAllArtists() {
  return db
    .select({
      id: users.id,
      name: users.name,
      artistBio: users.artistBio,
      profileImage: users.profileImage,
      artistType: users.artistType,
      socialMedia: users.socialMedia,
    })
    .from(users)
    .where(eq(users.onboardingCompleted, true))
    .execute();
}

export async function getArtistById(id: number) {
  const [artist] = await db
    .select({
      id: users.id,
      name: users.name,
      artistBio: users.artistBio,
      profileImage: users.profileImage,
      artistType: users.artistType,
      socialMedia: users.socialMedia,
    })
    .from(users)
    .where(and(eq(users.id, id), eq(users.onboardingCompleted, true)))
    .limit(1)
    .execute();

  return artist;
}

export async function getArtistWorks(artistId: number) {
  return db
    .select({
      id: contents.id,
      title: contents.title,
      ipfsUrl: contents.ipfsUrl,
      contentType: contents.contentType, // Add this line
    })
    .from(contents)
    .where(eq(contents.userId, artistId))
    .execute();
}
