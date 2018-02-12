import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StackNavigator } from 'react-navigation';
import Register from './components/Register';
import SignIn from './components/SignIn';
import Home from './components/Home';
// import RootNavigation from './navigation/RootNavigation';
import MainTabNavigator from './navigation/MainTabNavigator';

class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        {/* <SignIn /> */}
        {/* <RootNavigation /> */}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// the first index of the stack navigator will be rendered first in the app
// How do we set up the app so it checks if the user is signed in into react and
// determines to render signin screen (not signed in) or home screen (signed in)
const Routes = StackNavigator({
  // Navbar: { screen: Navbar },
  // Main: { screen: MainTabNavigator },
  SignIn: { screen: SignIn },
  Register: { screen : Register },
  Main: { screen: MainTabNavigator }
  // Home: { screen: Home },
});

export default Routes;