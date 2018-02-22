import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  AsyncStorage
} from "react-native";
import axios from "axios";
import { apiUrl } from "../config";
import { onSignIn } from "../auth";

export default class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: ""
    };
    this.signIn = this.signIn.bind(this);
  }

  signIn() {
    axios
      .post(`${apiUrl}/signin`, {
        username: this.state.username,
        password: this.state.password
      })
      .then(async response => {
        const token = response.data.token;
        onSignIn(token).then(() => this.props.navigation.navigate("SignedIn"));
      })
      .catch(error => {
        console.log(error);
        this.props.navigation.navigate("SignedOut");
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.headerTxt} >
          Block Party
        </Text>
        <Text style={styles.signInTxt} >
          Sign In
        </Text>
        <Text>
          {this.state.error && this.state.error.length
            ? this.state.error
            : null}
        </Text>
        <TextInput
          style={styles.textInput}
          onChangeText={username => this.setState({ username })}
          value={this.state.username}
          placeholder="username"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.textInput}
          onChangeText={password => this.setState({ password })}
          value={this.state.password}
          placeholder="password"
          secureTextEntry={true}
        />
        <Button
          title={"Submit"}
          onPress={this.signIn}
          style={styles.submitBtn}
        />

        <Text
          onPress={() => this.props.navigation.navigate("Register")}
          style={styles.registerSignInHereText}
        >
          Register Here!
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eff9ff",
    alignItems: "center",
    justifyContent: "center"
  },
  textInput: {
    height: 35,
    backgroundColor: "white",
    borderColor: "gray",
    borderWidth: 1,
    width: 300,
    marginBottom: 15
  },
  registerSignInHereText: {
    // fontFamily: "sans-serif",
    fontSize: 20,
    fontWeight: "bold",
    bottom: 150,
    position: 'absolute'
  },
  submitBtn: {
    marginTop: 140,
    position: 'relative'
  },
  signInTxt: {
    fontSize: 25,
  },
  headerTxt: {
    fontSize: 35,
    position: 'absolute',
    top: 20,
    marginBottom: 35
  },
});
