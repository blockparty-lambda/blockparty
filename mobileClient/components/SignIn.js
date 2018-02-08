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
      .post("http://192.168.0.3:3000/signIn", {
        username: this.state.username,
        password: this.state.password
      })
      .then(async response => {
        const token = response.data.token;
        await AsyncStorage.setItem("jwt", token);
        this.props.navigation.navigate("Home", { token });
      })
      .catch(error => {
        console.log(error);
        this.props.navigation.navigate("SignIn");
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Sign In</Text>
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
        />
        <TextInput
          style={styles.textInput}
          onChangeText={password => this.setState({ password })}
          value={this.state.password}
          placeholder="password"
          secureTextEntry={true}
        />
        <Button title={"Submit"} onPress={this.signIn} />

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
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  },
  textInput: {
    height: 20,
    borderColor: "gray",
    borderWidth: 1,
    width: 150
  },
  registerSignInHereText: {
    fontFamily: "sans-serif",
    fontSize: 20,
    fontWeight: "bold"
  }
});
