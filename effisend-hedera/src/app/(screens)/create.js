import { randomBytes, uuidV4 } from "ethers";
import { useNavigation } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";
import CamFace from "../../components/camFace";
import { AuthError, getUserMessage } from "../../core/errors";
import GlobalStyles, { mainColor, secondaryColor } from "../../core/styles";
import { useStateAsync } from "../../core/useAsyncState";
import {
  setAsyncStorageValue,
  setEncryptedStorageValue,
} from "../../core/utils";
import ContextModule from "../../providers/contextModule";

export default function CreateOrRecover() {
  const [loading, setLoading] = useState(false);
  const [take, setTake] = useStateAsync(false);
  const navigation = useNavigation();
  const context = useContext(ContextModule);

  useEffect(() => {
    const update = async () => {
      if (!context.value.starter) {
        navigation.navigate("index");
      } else if (context.value.accountId !== "") {
        navigation.navigate("(screens)/main");
      }
    };
    context.value.starter && update();
  }, [context.value.accountId, context.value.starter, navigation]);

  // Functions
  const createOrFetchFace = useCallback(async (image, nonce) => {
    try {
      const response = await fetch(`/api/createOrFetchFace`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nonce, image }),
      });
      return await response.json();
    } catch {
      return { result: null, error: "BAD REQUEST" };
    }
  }, []);

  const createOrFetchWallet = useCallback(async (user) => {
    try {
      const response = await fetch(`/api/createOrFetchWallet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user }),
      });
      return await response.json();
    } catch {
      return { result: null, error: "BAD REQUEST" };
    }
  }, []);

  const createWallet = useCallback(async (image) => {
    setLoading(true);
    const bytes = randomBytes(16);
    const nonce = `face_${uuidV4(bytes)}`;
    const { result: faceResult } = await createOrFetchFace(image, nonce);
    if (faceResult === null) {
      setLoading(false);
      const authErr = new AuthError("Face recognition failed", { step: "createOrFetchFace" });
      Toast.show({
        type: "error",
        text1: getUserMessage(authErr),
        text2: "Please try again with better lighting",
        position: "bottom",
        visibilityTime: 4000,
        autoHide: true,
      });
      return;
    } else {
      if (typeof faceResult === "string") {
        const { result: walletResult } = await createOrFetchWallet(faceResult);
        if (walletResult !== null) {
          const { user, accountId } = walletResult;
          await setEncryptedStorageValue({ user });
          await setAsyncStorageValue({ accountId });
          await context.setValueAsync({
            accountId,
          });
          navigation.navigate("(screens)/main");
          Toast.show({
            type: "info",
            text1: "You have won some SAUCE because you verified",
            text2: "Go to the Effisend ID tab to claim",
            position: "bottom",
            visibilityTime: 10000,
            autoHide: true,
          });
        }
      } else if (typeof faceResult === "boolean" && faceResult === true) {
        const { result: walletResult } = await createOrFetchWallet(nonce);
        // Wallet created
        if (walletResult !== null) {
          const { user, accountId } = walletResult;
          await setEncryptedStorageValue({ user });
          await setAsyncStorageValue({ accountId });
          await context.setValueAsync({
            accountId,
          });
          navigation.navigate("(screens)/main");
          Toast.show({
            type: "info",
            text1: "You have won some SAUCE because you verified",
            text2: "Go to the Effisend ID tab to claim",
            position: "bottom",
            visibilityTime: 10000,
            autoHide: true,
          });
        }
      }
    }
    setLoading(false);
  }, [context, createOrFetchFace, createOrFetchWallet, navigation]);

  return (
    <SafeAreaView style={[GlobalStyles.container]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={GlobalStyles.scrollContainer}
        contentContainerStyle={[GlobalStyles.scrollContainerContent]}
      >
        <View>
          <Text style={GlobalStyles.title}>FaceID</Text>
        </View>
        <View
          style={{
            height: "auto",
            width: "90%",
            borderColor: loading ? mainColor : secondaryColor,
            borderWidth: 5,
            borderRadius: 10,
            aspectRatio: 1,
          }}
        >
          <CamFace
            facing={"front"}
            take={take}
            onImage={(image) => createWallet(image)}
          />
        </View>
        <Pressable
          disabled={loading}
          style={[
            GlobalStyles.buttonStyle,
            { width: "90%" },
            loading ? { opacity: 0.5 } : {},
          ]}
          onPress={async () => {
            await setTake(true);
            await setTake(false);
          }}
        >
          <Text style={[GlobalStyles.buttonText]}>
            {loading ? "Verifying your identity..." : "Join / Recover"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
