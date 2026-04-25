// Basic Imports
import { useRouter } from "expo-router";
import { useContext, useEffect } from "react";
import { ActivityIndicator, Image, View } from "react-native";
import logoSplash from "../../assets/images/splash-iconC.png";
import GlobalStyles, { mainColor } from "../../core/styles";
import { replaceRoute } from "../../core/utils";
import ContextModule from "../../providers/contextModule";

export default function SplashLoading() {
  const context = useContext(ContextModule);
  const router = useRouter();
  useEffect(() => {
    if (context.value.starter) {
      if (context.value.accountId === "") {
        replaceRoute(router, "/create");
      } else {
        replaceRoute(router, "/main");
      }
    }
  }, [context.value.accountId, context.value.starter, router]);

  return (
    <View style={[GlobalStyles.container, { justifyContent: "center", gap: 32 }]}>
      <Image
        resizeMode="contain"
        source={logoSplash}
        alt="Main Logo"
        style={{
          width: "70%",
        }}
      />
      <ActivityIndicator size="large" color={mainColor} />
    </View>
  );
}
