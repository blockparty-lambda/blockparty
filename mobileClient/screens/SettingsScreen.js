import React from "react";
import { ScrollView, StyleSheet, Text, View, Button } from "react-native";
import { onSignOut } from "../auth";

export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: "Settings"
  };

  logout = () => {
    onSignOut().then(() => this.props.navigation.navigate("SignedOut"));
  };

  render() {
    return (
      <View>
        <Text>settings yooo</Text>
        <Button title="Logout" onPress={this.logout} />
      </View>
    );
  }
}
