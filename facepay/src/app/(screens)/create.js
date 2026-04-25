import { randomBytes, uuidV4 } from "ethers";
import { useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";
import CamFace from "../../components/camFace";
import { AuthError, getUserMessage } from "../../core/errors";
import GlobalStyles, { mainColor, secondaryColor } from "../../core/styles";
import { useStateAsync } from "../../core/useAsyncState";
import {
  isLocalDemoEnvironment,
  replaceRoute,
  setAsyncStorageValue,
  setEncryptedStorageValue,
} from "../../core/utils";
import ContextModule from "../../providers/contextModule";

export default function CreateOrRecover() {
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [take, setTake] = useStateAsync(false);
  const router = useRouter();
  const context = useContext(ContextModule);
  const showLocalDemoButton = isLocalDemoEnvironment();

  useEffect(() => {
    if (context.value.starter && context.value.accountId !== "") {
      replaceRoute(router, "/main");
    }
  }, [context.value.accountId, context.value.starter, router]);

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
            starter: true,
          });
          replaceRoute(router, "/main");
          Toast.show({
            type: "info",
            text1: "You have won some SAUCE because you verified",
            text2: "Go to the FacePay ID tab to claim",
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
            starter: true,
          });
          replaceRoute(router, "/main");
          Toast.show({
            type: "info",
            text1: "You have won some SAUCE because you verified",
            text2: "Go to the FacePay ID tab to claim",
            position: "bottom",
            visibilityTime: 10000,
            autoHide: true,
          });
        }
      }
    }
    setLoading(false);
  }, [context, createOrFetchFace, createOrFetchWallet, navigation]);

  const launchDemoWallet = useCallback(async () => {
    setDemoLoading(true);
    try {
      const { result: walletResult } = await createOrFetchWallet("face_demo_user");
      if (walletResult === null) {
        Toast.show({
          type: "error",
          text1: "Demo wallet unavailable",
          text2: "The local mock backend may not be running",
          position: "bottom",
          visibilityTime: 4000,
          autoHide: true,
        });
        return;
      }

      const { user, accountId } = walletResult;
      await setEncryptedStorageValue({ user });
      await setAsyncStorageValue({ accountId, lastRefresh: 0 });
      await context.setValueAsync({ accountId, starter: true });
      replaceRoute(router, "/main");
      Toast.show({
        type: "info",
        text1: "Demo wallet loaded",
        text2: "Mock Hedera balances and rewards are ready",
        position: "bottom",
        visibilityTime: 5000,
        autoHide: true,
      });
    } finally {
      setDemoLoading(false);
    }
  }, [context, createOrFetchWallet, router]);

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
            borderWidth: 3,
            borderRadius: 16,
            aspectRatio: 1,
            overflow: "hidden",
            shadowColor: loading ? mainColor : secondaryColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <CamFace
            facing={"front"}
            take={take}
            onCameraStateChange={setCameraReady}
            onImage={(image) => createWallet(image)}
          />
        </View>
        <Pressable
          disabled={loading || demoLoading}
          style={[
            GlobalStyles.buttonStyle,
            { width: "90%" },
            loading || demoLoading ? { opacity: 0.5 } : {},
          ]}
          onPress={async () => {
            if (!cameraReady) {
              Toast.show({
                type: "error",
                text1: "Camera not ready yet",
                text2: showLocalDemoButton
                  ? "Allow camera access or use Try Demo Wallet below"
                  : "Allow camera access and try again",
                position: "bottom",
                visibilityTime: 4000,
                autoHide: true,
              });
              return;
            }
            await setTake(true);
            await setTake(false);
          }}
        >
          <Text style={[GlobalStyles.buttonText]}>
            {loading ? "Verifying your identity..." : "Join / Recover"}
          </Text>
        </Pressable>
        {showLocalDemoButton && (
          <Pressable
            disabled={loading || demoLoading}
            style={[
              GlobalStyles.buttonCancelStyle,
              { width: "90%" },
              loading || demoLoading ? { opacity: 0.5 } : {},
            ]}
            onPress={launchDemoWallet}
          >
            <Text style={[GlobalStyles.buttonCancelText]}>
              {demoLoading ? "Launching demo wallet..." : "Try Demo Wallet"}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
