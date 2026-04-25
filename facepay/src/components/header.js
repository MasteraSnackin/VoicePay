import { useRouter } from "expo-router";
import { useContext, useMemo, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import Renders from "../assets/images/logo.png";
import Title from "../assets/images/title.png";
import GlobalStyles from "../core/styles";
import ContextModule, { createDefaultContextValue } from "../providers/contextModule";
import { clearAppStorage, isLocalDemoEnvironment, replaceRoute } from "../core/utils";

export default function Header() {
  const router = useRouter();
  const context = useContext(ContextModule);
  const [resettingDemo, setResettingDemo] = useState(false);
  const showDemoReset = useMemo(() => isLocalDemoEnvironment(), []);

  const resetDemo = async () => {
    setResettingDemo(true);
    await clearAppStorage();
    await context.setValueAsync({
      ...createDefaultContextValue(),
      starter: true,
    });
    setResettingDemo(false);
    replaceRoute(router, "/create");
  };

  return (
    <View style={[GlobalStyles.header, { paddingHorizontal: 10 }]}>
      <View style={[GlobalStyles.headerItem, { alignItems: "flex-start" }]}>
        <Image
          source={Renders}
          alt="Logo"
          style={{
            maxHeight: "80%",
            width: "auto",
            resizeMode: "contain",
            aspectRatio: 1,
          }}
        />
      </View>
      <View style={[GlobalStyles.headerItem, { alignItems: "flex-end" }]}>
        <Image
          source={Title}
          alt="Logo"
          style={{
            height: "auto",
            maxWidth: "100%",
            resizeMode: "contain",
            aspectRatio: 1,
          }}
        />
      </View>
      {showDemoReset && (
        <Pressable
          disabled={resettingDemo}
          onPress={resetDemo}
          style={{
            position: "absolute",
            right: 12,
            top: 18,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: "rgba(255, 255, 255, 0.18)",
            backgroundColor: "rgba(255, 255, 255, 0.06)",
          }}
        >
          <Text
            style={{
              color: "white",
              fontFamily: "Exo2_700Bold",
              fontSize: 12,
            }}
          >
            {resettingDemo ? "Resetting..." : "Reset Demo"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
