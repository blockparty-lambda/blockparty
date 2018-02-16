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
      <View style={styles.container}>
        <Text>Settings</Text>
        <Button title="Logout" onPress={this.logout} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: "#fff"
  }
});
