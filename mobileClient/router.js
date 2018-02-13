import React from "react";
import { Platform, StatusBar } from "react-native";
import { StackNavigator, TabNavigator, TabBarBottom } from "react-navigation";
import Ionicons from "react-native-vector-icons/Ionicons";
import Entypo from "react-native-vector-icons/Entypo";

import SignIn from "./components/SignIn";
import Register from "./components/Register";

import Colors from "./constants/Colors"; // Colors are for the finances, friends, settings icons

import FinancesScreen from "./screens/Finances";
import FriendsScreen from "./screens/Friends";
import SettingsScreen from "./screens/SettingsScreen";

export const SignedOut = StackNavigator({
  Register: {
    screen: Register,
    navigationOptions: {
      title: "Sign Up"
    }
  },
  SignIn: {
    screen: SignIn,
    navigationOptions: {
      title: "Sign In"
    }
  }
});

export const SignedIn = TabNavigator(
  {
    Finances: {
      screen: FinancesScreen
    },
    Friends: {
      screen: FriendsScreen
    },
    Settings: {
      screen: SettingsScreen
    }
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused }) => {
        const { routeName } = navigation.state;
        let iconName;
        switch (routeName) {
          case "Finances":
            return (
              <Ionicons
                name="logo-bitcoin"
                size={28}
                style={{ marginBottom: -3 }}
                color={focused ? Colors.tabIconSelected : Colors.tabIconDefault}
              />
            );
            break;
          case "Friends":
            return (
              <Entypo
                name="users"
                size={28}
                color={focused ? Colors.tabIconSelected : Colors.tabIconDefault}
              />
            );
            break;
          case "Settings":
            return (
              <Ionicons
                name={focused ? "ios-settings" : "ios-settings-outline"}
                size={28}
                style={{ marginBottom: -3 }}
                color={focused ? Colors.tabIconSelected : Colors.tabIconDefault}
              />
            );
            break;
        }
      }
    }),
    tabBarComponent: TabBarBottom,
    tabBarPosition: "bottom",
    animationEnabled: false,
    swipeEnabled: false
  }
);

export const createRootNavigator = (signedIn = false) => {
  return StackNavigator(
    {
      SignedIn: {
        screen: SignedIn,
        navigationOptions: {
          gesturesEnabled: false
        }
      },
      SignedOut: {
        screen: SignedOut,
        navigationOptions: {
          gesturesEnabled: false
        }
      }
    },
    {
      headerMode: "none",
      mode: "modal",
      initialRouteName: signedIn ? "SignedIn" : "SignedOut"
    }
  );
};
