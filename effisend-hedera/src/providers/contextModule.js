// Basic Imports
import React from "react";
import { blockchain } from "../core/constants";

const ContextModule = React.createContext();

// Context Provider Component

class ContextProvider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: {
        accountId: "",
        balances: blockchain.tokens.map(() => 0),
        usdConversion: blockchain.tokens.map(() => 1),
        starter: false,
        chatGeneral: [
          {
            message: `Hello i'm DeSmond, your personal AI Agent, at your service!`,
            type: "system",
            time: Date.now(),
            tool: "",
          },
        ],
      },
    };
    // Stable provider value — methods bound once, value ref updated in-place
    this._providerValue = {
      value: this.state.value,
      setValue: this.setValue,
      setValueAsync: this.setValueAsync,
    };
  }

  // Functional updater avoids stale state reads
  setValue = (value) => {
    this.setState((prev) => ({
      value: { ...prev.value, ...value },
    }));
  };

  setValueAsync = (value) => {
    return new Promise((resolve) =>
      this.setState(
        (prev) => ({
          value: { ...prev.value, ...value },
        }),
        () => resolve()
      )
    );
  };

  render() {
    // Update the value ref — methods are already stable (bound arrow functions)
    this._providerValue = {
      ...this._providerValue,
      value: this.state.value,
    };

    return (
      <ContextModule.Provider value={this._providerValue}>
        {this.props.children}
      </ContextModule.Provider>
    );
  }
}

// Dont Change anything below this line

export { ContextProvider };
export const ContextConsumer = ContextModule.Consumer;
export default ContextModule;
