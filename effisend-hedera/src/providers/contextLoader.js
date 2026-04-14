import { Fragment, useCallback, useContext, useEffect } from "react";
import ContextModule from "./contextModule";
import { getAsyncStorageValue } from "../core/utils";

export default function ContextLoader() {
  const context = useContext(ContextModule);
  const checkStarter = useCallback(async () => {
    try {
      // Batch all reads in parallel instead of sequential
      const [accountId, balances, usdConversion] = await Promise.all([
        getAsyncStorageValue("accountId"),
        getAsyncStorageValue("balances"),
        getAsyncStorageValue("usdConversion"),
      ]);
      if (accountId === null) {
        context.setValue({ starter: true });
      } else {
        context.setValue({
          accountId: accountId ?? context.value.accountId,
          balances: balances ?? context.value.balances,
          usdConversion: usdConversion ?? context.value.usdConversion,
          starter: true,
        });
      }
    } catch {
      // Storage read failed — start fresh
      context.setValue({ starter: true });
    }
  }, [context]);

  useEffect(() => {
    checkStarter();
  }, [checkStarter]);

  return <Fragment />;
}
