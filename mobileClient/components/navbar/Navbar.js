import React from 'react';
import { Button, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, StackNavigator, TabNavigator } from 'react-navigation';

import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo'
// import SampleText from './SampleText';
// import CustomTabs from './CustomTabs';

const MyNavScreen = ({ navigation, banner }) => (
  <ScrollView>
    <SafeAreaView forceInset={{ horizontal: 'always' }}>
    </SafeAreaView>
  </ScrollView>
);

const MyFinancesScreen = ({ navigation }) => (
  <MyNavScreen banner="Cryptocurrency Balances" navigation={navigation} />
);

const MyFriendsScreen = ({ navigation }) => (
  <MyNavScreen banner="Friends" navigation={navigation} />
);

const MyProfileScreen = ({ navigation }) => (
  <MyNavScreen
    banner={`${navigation.state.params.name}s Profile`}
    navigation={navigation}
  />
);

const MyNotificationsSettingsScreen = ({ navigation }) => (
  <MyNavScreen banner="Notifications Screen" navigation={navigation} />
);

const MySettingsScreen = ({ navigation }) => (
  <MyNavScreen banner="Settings Screen" navigation={navigation} />
);

const TabNav = TabNavigator(
  {
    MainTab: {
      screen: MyFinancesScreen,
      path: '/',
      navigationOptions: {
        title: 'Finances',
        tabBarLabel: 'Finances',
        tabBarIcon: ({ tintColor, focused }) => (
          <Ionicons
            name={focused ? 'logo-bitcoin' : 'logo-bitcoin'}
            size={26}
            style={{ color: tintColor }}
          />
        ),
      },
    },
    FriendsTab: {
      screen: MyFriendsScreen,
      path: '/',
      navigationOptions: {
        title: 'Friends',
        tabBarLabel: 'Friends',
        tabBarIcon: ({ tintColor, focused }) => (
          <Entypo
            name={focused ? 'users' : 'users'}
            size={26}
            style={{ color: tintColor }}
          />
        ),
      },
    },
    SettingsTab: {
      screen: MySettingsScreen,
      path: '/settings',
      navigationOptions: {
        title: 'Settings',
        tabBarIcon: ({ tintColor, focused }) => (
          <Ionicons
            name={focused ? 'ios-settings' : 'ios-settings-outline'}
            size={26}
            style={{ color: tintColor }}
          />
        ),
      },
    },
  },
  {
    tabBarPosition: 'bottom',
    animationEnabled: false,
    swipeEnabled: false,
  }
);

const StacksOverTabs = StackNavigator({
  Root: {
    screen: TabNav,
  },
  NotifSettings: {
    screen: MyNotificationsSettingsScreen,
    navigationOptions: {
      title: 'Notifications',
    },
  },
  Profile: {
    screen: MyProfileScreen,
    path: '/people/:name',
    navigationOptions: ({ navigation }) => {
      title: `${navigation.state.params.name}'s Profile!`;
    },
  },
});

export default StacksOverTabs;
