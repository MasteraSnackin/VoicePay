import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { fetch } from "expo/fetch";
import React, { Fragment, useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import GoogleWallet from "../../../assets/images/GW.png";
import { Toast } from "toastify-react-native";
import GlobalStyles, { fontSize as fontSizeTokens, mainColor } from "../../../core/styles";
import { useStateAsync } from "../../../core/useAsyncState";
import {
  formatTimestamp,
  getEncryptedStorageValue,
} from "../../../core/utils";
import ContextModule from "../../../providers/contextModule";

export default function Tab4() {
  const context = React.useContext(ContextModule);
  const scrollView = useRef(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputHeight, setInputHeight] = useStateAsync("auto");

  const chatWithAgent = useCallback(async (msg) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const user = await getEncryptedStorageValue("user");
    const raw = JSON.stringify({
      message: msg,
      context: {
        accountId: context.value.accountId,
        user,
      },
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };
    return new Promise((resolve) => {
      fetch("/api/chatWithAgent", requestOptions)
        .then((response) => response.json())
        .then((result) => resolve(result))
        .catch(() => resolve(null));
    });
  }, [context.value.accountId]);

  function responseModifier(response) {
    let temp = response;
    /**
      if (temp["last_tool"] === "transfer_to_multiple_spei") {
        temp.message = "All CLABE accounts received the payment successfully.";
      }
    */
    return temp;
  }

  const sendMessage = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setLoading(true);
    const userMessage = trimmed;
    setMessage("");
    let temp = [...context.value.chatGeneral];
    temp.push({
      message: userMessage,
      type: "user",
      time: Date.now(),
      tool: "",
    });
    await context.setValueAsync({
      chatGeneral: temp,
    });
    scrollView.current.scrollToEnd({ animated: true });
    // Optimistic: show thinking indicator while waiting
    const thinkingMsg = {
      message: "Thinking...",
      type: "system",
      time: Date.now(),
      tool: "",
      isThinking: true,
    };
    const tempWithThinking = [...temp, thinkingMsg];
    context.setValue({ chatGeneral: tempWithThinking });
    setTimeout(() => scrollView.current?.scrollToEnd({ animated: true }), 50);
    const response = await chatWithAgent(userMessage);
    if (!response || response.error) {
      temp.push({
        message: "Sorry, I couldn't process that request. Please try again.",
        type: "system",
        time: Date.now(),
        tool: "",
      });
      Toast.error("Agent unavailable. Check your connection.");
    } else {
      const finalResponse = responseModifier(response);
      temp.push({
        message: finalResponse.message,
        type: "system",
        time: Date.now(),
        tool: response["last_tool"],
      });
    }
    context.setValue({
      chatGeneral: temp,
    });
    setLoading(false);
    setTimeout(() => scrollView.current.scrollToEnd({ animated: true }), 100);
  }, [scrollView, context, message, setMessage, setLoading, chatWithAgent]);
  
  return (
    <Fragment>
      <ScrollView
        ref={(view) => {
          scrollView.current = view;
        }}
        showsVerticalScrollIndicator={false}
        style={[GlobalStyles.scrollContainer]}
        contentContainerStyle={[
          GlobalStyles.scrollContainerContent,
          {
            width: "90%",
            height: "auto",
            alignSelf: "center",
            gap: 0,
          },
        ]}
      >
        {context.value.chatGeneral.length === 0 && !loading && (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 80,
              gap: 12,
            }}
          >
            <Ionicons name="chatbubbles-outline" size={64} color="#333" />
            <Text
              style={{
                color: "#666",
                fontSize: 16,
                textAlign: "center",
                fontFamily: "Exo2_400Regular",
              }}
            >
              Ask the AI agent about your balance,{"\n"}transfers, or Hedera network info.
            </Text>
          </View>
        )}
        {context.value.chatGeneral.map((item, index, array) => (
          <LinearGradient
            angle={90}
            useAngle={true}
            key={`Message:${index}`}
            style={[
              {
                borderRadius: 10,
                borderBottomRightRadius: item.type === "user" ? 0 : 10,
                borderBottomLeftRadius: item.type === "user" ? 10 : 0,
                paddingHorizontal: 16,
                paddingVertical: 10,
                maxWidth: "80%",
                alignSelf: item.type === "user" ? "flex-end" : "flex-start",
              },
              index !== 0 && array[index - 1].type !== item.type
                ? { marginTop: 16 }
                : { marginTop: 5 },
            ]}
            colors={[
              item.type === "user" ? mainColor + "cc" : mainColor + "40",
              item.type === "user" ? mainColor + "cc" : mainColor + "40",
            ]}
          >
            <Text
              style={{
                color: "white",
                textAlign: "justify",
                marginBottom: 10,
                fontSize: fontSizeTokens.md,
                fontStyle: item.isThinking ? "italic" : "normal",
                opacity: item.isThinking ? 0.6 : 1,
              }}
            >
              {item.isThinking ? "Thinking..." : item.message}
            </Text>
            {item.tool === "fund_metamask_card" && (
              <Pressable
                style={{
                  padding: 10,
                }}
                onPress={() => {
                  Linking.openURL(
                    "intent://com.google.android.apps.walletnfcrel/#Intent;scheme=android-app;package=com.google.android.apps.walletnfcrel;end"
                  );
                }}
              >
                <Image
                  style={{
                    height: "auto",
                    width: "100%",
                    aspectRatio: 854 / 197,
                    alignSelf: "center",
                  }}
                  source={GoogleWallet}
                />
              </Pressable>
            )}
            <Text
              style={{
                color: "#cccccc",
                alignSelf: "flex-end",
                fontSize: fontSizeTokens.xs,
                marginRight: -5,
                marginBottom: -5,
              }}
            >
              {formatTimestamp(item.time)}
            </Text>
          </LinearGradient>
        ))}
      </ScrollView>
      <View
        style={[
          {
            height: "auto",
            width: "94%",
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginVertical: 10,
          },
        ]}
      >
        <TextInput
          onPressOut={() => scrollView.current.scrollToEnd({ animated: true })}
          onChange={() => scrollView.current.scrollToEnd({ animated: true })}
          onFocus={() => scrollView.current.scrollToEnd({ animated: true })}
          multiline
          onContentSizeChange={async (event) => {
            if (event.nativeEvent.contentSize.height < 120) {
              await setInputHeight(event.nativeEvent.contentSize.height);
              scrollView.current.scrollToEnd({ animated: true });
            }
          }}
          style={[
            GlobalStyles.inputChat,
            {
              height: inputHeight,
            },
          ]}
          keyboardType="default"
          value={message}
          onChangeText={setMessage}
          placeholder="Ask the AI agent..."
          placeholderTextColor="#666"
          accessibilityLabel="Chat message input"
          accessibilityHint="Type a message to send to the AI agent"
        />
        <Pressable
          onPress={sendMessage}
          disabled={message.trim().length <= 0 || loading}
          accessibilityRole="button"
          accessibilityLabel="Send message"
          android_ripple={{ color: "rgba(255,255,255,0.2)" }}
          style={[
            {
              width: "10%",
              height: "auto",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: mainColor,
              borderRadius: 50,
              aspectRatio: 1,
              padding: 20,
            },
            message.trim().length <= 0 || loading ? { opacity: 0.5 } : {},
          ]}
        >
          {loading ? (
            <ActivityIndicator size={22} color="white" />
          ) : (
            <Ionicons name="send" size={22} color="white" />
          )}
        </Pressable>
      </View>
    </Fragment>
  );
}
