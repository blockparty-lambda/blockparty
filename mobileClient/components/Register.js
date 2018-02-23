import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Keyboard
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import axios from "axios";
import { apiUrl } from "../config";

export default class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      username: "",
      password: "",
      passwordRepeat: ""
    };
    this.register = this.register.bind(this);
  }
  componentDidMount() {
    Keyboard.dismiss();
  }

  register() {
    axios
      .post(`${apiUrl}/register`, {
        email: this.state.email,
        username: this.state.username,
        password: this.state.password
      })
      .then(response => {
        if (response.data.code === 11000) {
          return this.setState({
            error: "Email already taken"
          });
        }
        this.props.navigation.navigate("SignIn");
      })
      .catch(error => {
        console.log(error);
      });
  }

  render() {
    return (
      <KeyboardAwareScrollView
        resetScrollToCoords={{ x: 0, y: 0 }}
        contentContainerStyle={styles.container}
        enableOnAndroid
        keyboardShouldPersistTaps="always"
        scrollEnabled={false}
      >
        <Text style={styles.headerTxt}>Block Party</Text>
        <Text style={styles.registerTxt}>Register</Text>
        <Text>
          {this.state.error && this.state.error.length
            ? this.state.error
            : null}
        </Text>
        <TextInput
          style={styles.textInput}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          onChangeText={email => this.setState({ email })}
          value={this.state.email}
          placeholder="email"
        />
        <TextInput
          style={styles.textInput}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          onChangeText={username => this.setState({ username })}
          value={this.state.username}
          placeholder="username"
        />
        <TextInput
          style={styles.textInput}
          onChangeText={password => this.setState({ password })}
          value={this.state.password}
          returnKeyType="next"
          placeholder="password"
          secureTextEntry={true}
        />
        <TextInput
          style={styles.textInput}
          onChangeText={passwordRepeat => this.setState({ passwordRepeat })}
          value={this.state.passwordRepeat}
          placeholder="repeat password"
          returnKeyType="done"
          secureTextEntry={true}
        />
        <Button title={"Submit"} onPress={this.register} />

        <Text
          onPress={() => this.props.navigation.navigate("SignIn")}
          style={styles.registerSignInHereText}
        >
          Already Registered?
        </Text>
      </KeyboardAwareScrollView>
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
    paddingLeft: 5,
    width: 300,
    marginBottom: 15
  },
  registerSignInHereText: {
    fontSize: 20,
    fontWeight: "bold"
  },
  registerTxt: {
    fontSize: 25
  },
  headerTxt: {
    fontSize: 35,
    marginBottom: 35
  }
});
