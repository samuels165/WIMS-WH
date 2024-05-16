import * as React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import Ionicons from "react-native-vector-icons/Ionicons";

import MenuScreen from "./screens/MenuScreen";
import HomeScreen from "./screens/HomeScreen";
import SettingsScreen from "./screens/SettingsScreen";

const initialLayout = { width: Dimensions.get("window").width };

const renderTabBar = (props) => {
  const { navigationState, position, jumpTo } = props;

  const renderBackButton = () => {
    if (navigationState.index > 0) {
      return (
        <TouchableOpacity
          onPress={() => jumpTo(navigationState.routes[0].key)}
          style={{ position: "absolute", top: 0, left: 10, zIndex: 1 }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      );
    } else {
      return null;
    }
  };

  return (
    <View
      style={{ flexDirection: "row", backgroundColor: "#C7B288", height: 60 }}
    >
      {renderBackButton()}
      <TabBar
        {...props}
        indicatorStyle={{ backgroundColor: "white" }}
        style={{ flex: 1 }}
        renderLabel={({ route, focused, color }) => (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name={
                route.key === "Menu"
                  ? "menu"
                  : route.key === "Sett"
                  ? "settings"
                  : route.key === "Home"
                  ? "home"
                  : ""
              }
              size={18}
              color={focused ? "white" : "white"} // Make the icon transparent when not focused
              style={{ marginRight: 8 }}
            />
            <Text style={{ color, fontSize: 14 }}>{route.title}</Text>
          </View>
        )}
      />
    </View>
  );
};

const MainContainer = () => {
  const [index, setIndex] = React.useState(1); // Set initial index to 1 (Home)
  const [routes] = React.useState([
    { key: "Menu", title: "Menu" },
    { key: "Home", title: "Main page" },
    { key: "Sett", title: "Settings" },
  ]);

  const renderScene = SceneMap({
    Menu: MenuScreen,
    Home: HomeScreen,
    Sett: SettingsScreen,
  });

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={initialLayout}
      renderTabBar={renderTabBar}
      swipeEnabled={true}
      tabBarPosition="bottom" // Set the tabBarPosition to "bottom"
    />
  );
};

export default MainContainer;
