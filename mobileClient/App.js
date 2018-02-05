import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StackNavigator } from 'react-navigation';
import Register from './components/Register';
import SignIn from './components/SignIn';
import Home from './components/Home';
// import { Register, SignIn, Home } from './components';

class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <SignIn />
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

const Routes = StackNavigator({
  SignIn: { screen : SignIn },
  Register: { screen : Register },
  Home: { screen: Home }
});

export default Routes;