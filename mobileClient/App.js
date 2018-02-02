import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StackNavigator } from 'react-navigation';
import Register from './components/Register';
import SignIn from './components/SignIn';

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
  // Home: { screen: Home },
  Register: { screen : Register },
  SignIn: { screen : SignIn },
});

export default Routes;