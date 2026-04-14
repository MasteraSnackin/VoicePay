// Basic Imports
import { useNavigation } from "expo-router";
import { useContext, useEffect } from "react";
import { ActivityIndicator, Image, View } from "react-native";
import logoSplash from "../../assets/images/splash-iconC.png";
import GlobalStyles, { mainColor } from "../../core/styles";
import ContextModule from "../../providers/contextModule";

export default function SplashLoading() {
  const context = useContext(ContextModule);
  const navigation = useNavigation();
  useEffect(() => {
    const update = async () => {
      if (context.value.accountId === "") {
        navigation.navigate("(screens)/create");
      } else {
        navigation.navigate("(screens)/main");
      }
    };
    context.value.starter && update();
  }, [context.value.accountId, context.value.starter, navigation]);

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
