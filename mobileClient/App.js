import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { StackNavigator } from "react-navigation";
import Register from "./components/Register";
import SignIn from "./components/SignIn";
import Home from "./components/Home";
import { createRootNavigator } from "./router";
import { isSignedIn } from "./auth";
import { Font } from 'expo';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      signedIn: false,
      checkedSignIn: false
    };
  }

  async componentWillMount() {
    isSignedIn()
      .then(res => this.setState({ signedIn: res, checkedSignIn: true }))
      .catch(error => alert("An error occurred"));
  }

// add fonts
  // TODO: possibly do we add a fontLoaded prop for handling loading custom fonts? reference: https://docs.expo.io/versions/latest/guides/using-custom-fonts.html
  async componentDidMount() {
    await Font.loadAsync({
      'space-mono-regular': require('./assets/fonts/SpaceMono-Regular.ttf'),
      'space-mono-bold': require('./assets/fonts/SpaceMono-Bold.ttf'),
      'megrim': require('./assets/fonts/Megrim.ttf'),
    });

    // apparently you can set default props with 'defaultProps'
    // Text.defaultProps.style = { fontFamily: 'space-mono-regular' };
  }

  render() {
    const { signedIn, checkedSignIn } = this.state;
    if (!checkedSignIn) {
      return null;
    }

    const Layout = createRootNavigator(signedIn);
    return (
      <Layout />
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});
