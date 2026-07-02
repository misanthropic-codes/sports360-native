import AsyncStorage from "@react-native-async-storage/async-storage";

const USER_KEY = "user";
const TOKEN_KEY = "token";

export async function getStoredAuthToken(): Promise<string | null> {
  const directToken = await AsyncStorage.getItem(TOKEN_KEY);
  if (directToken) return directToken;

  const savedUser = await AsyncStorage.getItem(USER_KEY);
  if (!savedUser) return null;

  try {
    const parsed = JSON.parse(savedUser);
    return parsed?.token ?? null;
  } catch {
    return null;
  }
}

export async function persistAuthToken(
  token: string | null | undefined
): Promise<void> {
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
}
