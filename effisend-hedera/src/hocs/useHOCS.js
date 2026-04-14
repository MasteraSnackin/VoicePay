import {
  useGlobalSearchParams,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";

function getCurrentRoute(navigation) {
  const state = navigation.getState();
  return state.routes[state.index].name;
}

export function withHOCS(Component) {
  function WrappedComponent(props) {
    const navigation = useNavigation();
    const route = getCurrentRoute(navigation);
    const glob = useGlobalSearchParams();
    const local = useLocalSearchParams();
    return (
      <Component
        glob={glob}
        local={local}
        navigation={navigation}
        route={route}
        {...props}
      />
    );
  }

  WrappedComponent.displayName = `withHOCS(${Component.displayName || Component.name || "Component"})`;
  return WrappedComponent;
}
