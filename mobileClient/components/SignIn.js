import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  AsyncStorage,
  Keyboard
} from "react-native";
import { Button } from "react-native-elements";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import axios from "axios";
import { apiUrl } from "../config";
import { onSignIn } from "../auth";

export default class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      error: ""
    };
    this.signIn = this.signIn.bind(this);
  }

  componentDidMount() {
    Keyboard.dismiss();
  }

  signIn() {
    axios
      .post(`${apiUrl}/signin`, {
        username: this.state.username,
        password: this.state.password
      })
      .then(async response => {
        const token = response.data.token;
        onSignIn(token, this.state.username).then(() =>
          this.props.navigation.navigate("SignedIn")
        );
      })
      .catch(error => {
        if (error.response.status === 401) {
          this.setState({
            error: "Incorrect username/password combination",
            password: "",
            username: ""
          });
        }
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
        <Text style={styles.signInTxt}>Sign In</Text>
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
          returnKeyType="next"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.textInput}
          onChangeText={password => this.setState({ password })}
          value={this.state.password}
          placeholder="password"
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="done"
          secureTextEntry={true}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            width: "85%",
            marginTop: 5
          }}
        >
          <Button
            text={"Sign In"}
            onPress={this.signIn}
            clear
            containerStyle={styles.btnContainer}
            textStyle={{ color: "dodgerblue" }}
            buttonStyle={styles.submitBtn}
          />

          <Button
            text="Sign Up"
            containerStyle={styles.btnContainer}
            clear
            textStyle={{ color: "dodgerblue" }}
            buttonStyle={styles.submitBtn}
            onPress={() => this.props.navigation.navigate("Register")}
          />
        </View>
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
    // fontFamily: "sans-serif",
    fontSize: 20
  },
  submitBtn: {
    marginBottom: 5,
    borderColor: "dodgerblue",
    borderRadius: 0,
    borderBottomWidth: 2,
    alignSelf: "stretch"
  },
  signInTxt: {
    fontSize: 25
  },
  headerTxt: {
    fontSize: 35,
    marginBottom: 35
  },
  registerButton: {
    marginTop: 10
  },
  btnContainer: {
    flex: 1,
    alignSelf: "stretch"
  }
});
