const API_URL =
  "https://api.urest.in:8096/api/Asset/GetAssetCheckInOutHistoryByAssetId";

export async function getAssetCheckInOutHistoryByAssetId(assetId) {
  try {
    const response = await fetch(`${API_URL}?AssetId=${assetId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to load asset check-in / check-out history");
    }

    return await response.json();
  } catch (error) {
    console.error("Asset history fetch error:", error);
    throw error;
  }
}
