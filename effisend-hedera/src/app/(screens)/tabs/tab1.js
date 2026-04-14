import Clipboard from "@react-native-clipboard/clipboard";
import { formatUnits, randomBytes, uuidV4 } from "ethers";
import { LinearGradient } from "expo-linear-gradient";
import { fetch } from "expo/fetch";
import { Component, Fragment } from "react";
import {
  Keyboard,
  NativeEventEmitter,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  ToastAndroid,
  View,
} from "react-native";
import IconIonicons from "react-native-vector-icons/Ionicons";
import { Toast } from "toastify-react-native";
import QrAddress from "../../../components/qrAddress";
import { BalanceSkeleton, TokenListSkeleton } from "../../../components/skeleton";
import { blockchain, refreshTime } from "../../../core/constants";
import GlobalStyles, { mainColor } from "../../../core/styles";
import {
  arraySum,
  epsilonRound,
  getAsyncStorageValue,
  getEncryptedStorageValue,
  normalizeFontSize,
  setAsyncStorageValue,
} from "../../../core/utils";
import { withHOCS } from "../../../hocs/useHOCS";
import ContextModule from "../../../providers/contextModule";

const baseTab1State = {
  // Transaction settings
  amount: "",
  loading: false,
  take: false,
  keyboardHeight: 0,
  selector: 0,
  qrData: "",
  cameraDelayLoading: false, // Force the camera to load when component is mounted and helps UX
};

class Tab1 extends Component {
  constructor(props) {
    super(props);
    this.state = baseTab1State;
    this.EventEmitter = new NativeEventEmitter();
    this.controller = new AbortController();
    this._isMounted = false;
  }

  static contextType = ContextModule;

  async getlastRefresh() {
    try {
      const lastRefresh = await getAsyncStorageValue("lastRefresh");
      if (lastRefresh === null) throw "Set First Date";
      return lastRefresh;
    } catch (_err) {
      await setAsyncStorageValue({ lastRefresh: 0 });
      return 0;
    }
  }

  async componentDidMount() {
    this._isMounted = true;
    setTimeout(async () => {
      if (!this._isMounted) return;
      if (this.context.value.accountId !== "") {
        // Event Emitter
        this.EventEmitter.addListener("refresh", async () => {
          if (!this._isMounted) return;
          Keyboard.dismiss();
          await this.setStateAsync(baseTab1State);
          await setAsyncStorageValue({ lastRefresh: Date.now() });
          this.refresh();
        });
        // Get Last Refresh
        const lastRefresh = await this.getlastRefresh();
        if (Date.now() - lastRefresh >= refreshTime) {
          await setAsyncStorageValue({ lastRefresh: Date.now() });
          this.refresh();
        } else {
          // Next refresh not yet available
        }
      }
    }, 1000);
    setTimeout(() => this.setState({ cameraDelayLoading: true }), 1);
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.controller.abort();
    this.EventEmitter.removeAllListeners("refresh");
  }

  async getUSD() {
    const array = blockchain.tokens.map((token) => token.coingecko);
    const myHeaders = new Headers();
    myHeaders.append("accept", "application/json");
    const requestOptions = {
      signal: this.controller.signal,
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${array.toString()}&vs_currencies=usd`,
      requestOptions
    );
    const result = await response.json();
    const usdConversion = array.map((x) => result[x]?.usd ?? 0);
    setAsyncStorageValue({ usdConversion });
    this.context.setValue({ usdConversion });
  }

  async refresh() {
    await this.setStateAsync({ refreshing: true });
    try {
      await Promise.all([this.getUSD(), this.getBalance()]);
    } catch (_e) {
      Toast.error("Failed to refresh balances. Pull down to retry.");
    }
    await this.setStateAsync({ refreshing: false });
  }

  hederaGetBalance = async () => {
    try {
      const response = await fetch(`/api/hederaGetBalance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: this.context.value.accountId }),
      });
      return await response.json();
    } catch {
      return { result: null, error: "BAD REQUEST" };
    }
  };

  async getBalance() {
    const { result } = await this.hederaGetBalance();
    if (!result) return;
    const balances = blockchain.tokens.map((token, index) => {
      if (index === 0) {
        return parseFloat(result.hbar);
      } else {
        try {
          return parseFloat(
            formatUnits(result.tokens[token.accountId].low, token.decimals)
          );
        } catch (_e) {
          return 0.0;
        }
      }
    });
    setAsyncStorageValue({ balances });
    this.context.setValue({ balances });
  }

  async createPayment(tempNonce) {
    try {
      const tempUser = await getEncryptedStorageValue("user");
      const response = await fetch(`/api/createPayment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nonce: tempNonce, user: tempUser }),
      });
      const data = await response.json();
      return data.result;
    } catch {
      return null;
    }
  }

  async createQR() {
    this.setState({ loading: true });
    try {
      const bytes = randomBytes(16);
      const noncePayment = uuidV4(bytes);
      const { res } = await this.createPayment(noncePayment);
      if (!this._isMounted) return;
      if (res === "BAD REQUEST") {
        this.setState({ loading: false });
        return;
      }
      this.setState({ loading: false, qrData: noncePayment });
    } catch {
      if (this._isMounted) this.setState({ loading: false });
    }
  }

  // Utils
  async setStateAsync(value) {
    return new Promise((resolve) => {
      this.setState(
        {
          ...value,
        },
        () => resolve()
      );
    });
  }

  render() {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          this.context.value.accountId !== "" && (
            <RefreshControl
              progressBackgroundColor={mainColor}
              refreshing={this.state.refreshing}
              onRefresh={async () => {
                await setAsyncStorageValue({
                  lastRefresh: Date.now().toString(),
                });
                await this.refresh();
              }}
            />
          )
        }
        style={[GlobalStyles.scrollContainer]}
        contentContainerStyle={[
          GlobalStyles.scrollContainerContent,
          { width: "90%", alignSelf: "center" },
        ]}
      >
        <LinearGradient
          style={{
            justifyContent: "center",
            alignItems: "center",
            width: "110%",
            marginTop: 20,
            paddingVertical: 24,
            borderRadius: 20,
          }}
          colors={["#000000", "#0a0a0a", "#1a1a1a", "#0a0a0a", "#000000"]}
        >
          <Text style={[GlobalStyles.title]}>FaceID Balance</Text>
          {this.state.refreshing ? (
            <BalanceSkeleton />
          ) : (
            <Text style={[GlobalStyles.balance]}>
              {`$ ${epsilonRound(
                arraySum(
                  this.context.value.balances.map(
                    (balance, i) => balance * this.context.value.usdConversion[i]
                  )
                ),
                2
              )} USD`}
            </Text>
          )}
        </LinearGradient>
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-around",
            alignItems: "center",
            marginTop: 20,
            marginBottom: 10,
          }}
        >
          <Pressable
            disabled={this.state.loading}
            android_ripple={{ color: "rgba(255,255,255,0.1)" }}
            style={({ pressed }) => [
              GlobalStyles.buttonSelectorSelectedStyle,
              this.state.selector !== 0 && {
                borderColor: "#aaaaaa",
              },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => this.setState({ selector: 0 })}
            accessibilityRole="tab"
            accessibilityLabel="View token balances"
            accessibilityState={{ selected: this.state.selector === 0 }}
          >
            <Text style={[GlobalStyles.buttonTextSmall]}>Tokens</Text>
          </Pressable>
          <Pressable
            disabled={this.state.loading}
            android_ripple={{ color: "rgba(255,255,255,0.1)" }}
            style={({ pressed }) => [
              GlobalStyles.buttonSelectorSelectedStyle,
              this.state.selector !== 1 && {
                borderColor: "#aaaaaa",
              },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => this.setState({ selector: 1 })}
            accessibilityRole="tab"
            accessibilityLabel="Show receive address"
            accessibilityState={{ selected: this.state.selector === 1 }}
          >
            <Text style={[GlobalStyles.buttonTextSmall]}>Receive</Text>
          </Pressable>
          <Pressable
            disabled={this.state.loading}
            android_ripple={{ color: "rgba(255,255,255,0.1)" }}
            style={({ pressed }) => [
              GlobalStyles.buttonSelectorSelectedStyle,
              this.state.selector !== 2 && {
                borderColor: "#aaaaaa",
              },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => this.setState({ selector: 2 })}
            accessibilityRole="tab"
            accessibilityLabel="Create QR payment"
            accessibilityState={{ selected: this.state.selector === 2 }}
          >
            <Text style={[GlobalStyles.buttonTextSmall]}>QR Pay</Text>
          </Pressable>
        </View>
        {this.state.selector === 0 && (
          <View style={{ width: "100%", gap: 8 }}>
            {this.state.refreshing && this.context.value.balances.every(b => b === 0) ? (
              <TokenListSkeleton count={5} />
            ) : blockchain.tokens.map((token, i) => (
              <View key={`${i}`} style={GlobalStyles.network}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-around",
                  }}
                >
                  <View style={GlobalStyles.networkMarginIcon}>
                    {token.icon}
                  </View>
                  <View style={{ justifyContent: "center" }}>
                    <Text style={GlobalStyles.networkTokenName}>
                      {token.name}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "flex-start",
                      }}
                    >
                      <Text style={GlobalStyles.networkTokenData}>
                        {this.context.value.balances[i] === 0
                          ? "0"
                          : this.context.value.balances[i] < 0.001
                          ? "<0.001"
                          : epsilonRound(
                              this.context.value.balances[i],
                              3
                            )}{" "}
                        {token.symbol}
                      </Text>
                      <Text style={GlobalStyles.networkTokenData}>
                        {`  -  ($${epsilonRound(
                          this.context.value.usdConversion[i],
                          4
                        )} USD)`}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={{ marginHorizontal: 20 }}>
                  <Text style={{ color: "white" }}>
                    $
                    {epsilonRound(
                      this.context.value.balances[i] *
                        this.context.value.usdConversion[i],
                      2
                    )}{" "}
                    USD
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
        {this.state.selector === 1 && (
          <Fragment>
            <View
              style={{
                width: "90%",
                height: "auto",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <QrAddress address={this.context.value.accountId} />
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-start",
                alignItems: "center",
                width: "100%",
                gap: 10,
                paddingBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: normalizeFontSize(22),
                  fontWeight: "bold",
                  color: "white",
                  textAlign: "center",
                  width: "85%",
                }}
              >
                {this.context.value.accountId}
              </Text>
              <Pressable
                onPress={() => {
                  Clipboard.setString(this.context.value.accountId);
                  if (Platform.OS === "web") {
                    Toast.show({
                      type: "info",
                      text1: "Address copied to clipboard",
                      position: "bottom",
                      visibilityTime: 3000,
                      autoHide: true,
                    });
                  } else {
                    ToastAndroid.show(
                      "Address copied to clipboard",
                      ToastAndroid.LONG
                    );
                  }
                }}
                style={{
                  width: "15%",
                  alignItems: "flex-start",
                }}
              >
                <IconIonicons name="copy" size={30} color={"white"} />
              </Pressable>
            </View>
          </Fragment>
        )}
        {this.state.selector === 2 && (
          <Fragment>
            {this.state.qrData === "" ? (
              <View
                style={{
                  flex: 1,
                  width: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Pressable
                  disabled={this.state.loading}
                  android_ripple={{ color: "rgba(255,255,255,0.2)" }}
                  style={({ pressed }) => [
                    GlobalStyles.buttonStyle,
                    this.state.loading ? { opacity: 0.5 } : {},
                    pressed && GlobalStyles.buttonStylePressed,
                  ]}
                  onPress={() => this.createQR()}
                  accessibilityRole="button"
                  accessibilityLabel="Create QR payment code"
                >
                  <Text style={[GlobalStyles.buttonText]}>
                    {this.state.loading ? "Creating..." : "Create QR Payment"}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Fragment>
                <Text style={GlobalStyles.formTitleCard}>Payment QR</Text>
                <View
                  style={{
                    width: "90%",
                    height: "auto",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <QrAddress address={this.state.qrData} />
                </View>
              </Fragment>
            )}
          </Fragment>
        )}
      </ScrollView>
    );
  }
}

export default withHOCS(Tab1);
