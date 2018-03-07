import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  AsyncStorage,
  Keyboard,
  Switch
} from "react-native";
import { Button, Input, Icon } from "react-native-elements";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import axios from "axios";
import { apiUrl } from "../config";
import { onSignIn } from "../auth";

export default class SignIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      username: "",
      password: "",
      passwordRepeat: "",
      error: "",
      signIn: true
    };
  }

  componentDidMount() {
    Keyboard.dismiss();
  }

  signIn = () => {
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
  };

  register = () => {
    axios
      .post(`${apiUrl}/register`, {
        email: this.state.email,
        username: this.state.username,
        password: this.state.password
      })
      .then(response => {
        this.setState({ signIn: true });
      })
      .catch(error => {
        if (error.response.data.error.slice(0, 6) === "E11000") {
          this.setState({
            error: "User already exists"
          });
        }
      });
  };

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
        <Text style={{ color: "#fc6670" }}>
          {this.state.error && this.state.error.length
            ? this.state.error
            : null}
        </Text>
        {this.state.signIn && (
          <View style={styles.signInView}>
            <Input
              inputStyle={styles.textInput}
              containerStyle={styles.textInputContainer}
              onChangeText={username => this.setState({ username })}
              value={this.state.username}
              placeholder="username"
              returnKeyType="next"
              autoCapitalize="none"
              placeholderTextColor="#c5c6c7"
              leftIcon={
                <Icon type="entypo" name="user" size={24} color="#45a29e" />
              }
              autoCorrect={false}
            />
            <Input
              inputStyle={styles.textInput}
              containerStyle={styles.textInputContainer}
              onChangeText={password => this.setState({ password })}
              value={this.state.password}
              placeholder="password"
              placeholderTextColor="#c5c6c7"
              leftIcon={<Icon name="lock" size={24} color="#45a29e" />}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="done"
              secureTextEntry={true}
            />
          </View>
        )}

        {!this.state.signIn && (
          <View style={styles.registerView}>
            <Input
              inputStyle={styles.textInput}
              containerStyle={styles.textInputContainer}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onChangeText={email => this.setState({ email })}
              leftIcon={<Icon name="email" size={24} color="#45a29e" />}
              value={this.state.email}
              placeholder="email"
              placeholderTextColor="#c5c6c7"
            />
            <Input
              inputStyle={styles.textInput}
              containerStyle={styles.textInputContainer}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onChangeText={username => this.setState({ username })}
              leftIcon={
                <Icon type="entypo" name="user" size={24} color="#45a29e" />
              }
              value={this.state.username}
              placeholder="username"
              placeholderTextColor="#c5c6c7"
            />
            <Input
              inputStyle={styles.textInput}
              containerStyle={styles.textInputContainer}
              onChangeText={password => this.setState({ password })}
              value={this.state.password}
              leftIcon={<Icon name="lock" size={24} color="#45a29e" />}
              returnKeyType="next"
              placeholderTextColor="#c5c6c7"
              placeholder="password"
              secureTextEntry={true}
            />
            <Input
              inputStyle={styles.textInput}
              containerStyle={styles.textInputContainer}
              onChangeText={passwordRepeat => this.setState({ passwordRepeat })}
              value={this.state.passwordRepeat}
              leftIcon={<Icon name="lock" size={24} color="#45a29e" />}
              placeholder="repeat password"
              placeholderTextColor="#c5c6c7"
              returnKeyType="done"
              secureTextEntry={true}
            />
          </View>
        )}
        <View style={{ flexDirection: "row", marginTop: 15 }}>
          <Text style={{ color: "#45a29e", fontFamily: "space-mono-regular" }}>
            Register{" "}
          </Text>
          <Switch
            value={this.state.signIn}
            tintColor="#45a29e"
            thumbTintColor="#45a29e"
            onValueChange={() => this.setState({ signIn: !this.state.signIn })}
          />
          <Text style={{ color: "#45a29e", fontFamily: "space-mono-regular" }}>
            {" "}
            Sign In
          </Text>
        </View>

        {this.state.signIn && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "75%",
              position: "absolute",
              bottom: 35
            }}
          >
            <Button
              text={"SIGN IN"}
              onPress={this.signIn}
              clear
              containerStyle={styles.btnContainer}
              textStyle={{ color: "#66fcf1", fontFamily: "space-mono-bold" }}
              buttonStyle={styles.submitBtn}
            />
          </View>
        )}

        {!this.state.signIn && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              width: "75%",
              position: "absolute",
              bottom: 35
            }}
          >
            <Button
              text={"REGISTER"}
              onPress={this.register}
              clear
              containerStyle={styles.btnContainer}
              textStyle={{ color: "#66fcf1", fontFamily: "space-mono-bold" }}
              buttonStyle={styles.submitBtn}
            />
          </View>
        )}
      </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0c10",
    alignItems: "center",
    justifyContent: "center"
  },
  textInput: {
    height: 35,
    borderColor: "transparent",
    color: "#45a29e",
    width: 300,
    marginVertical: 5
  },
  textInputContainer: {
    backgroundColor: "#1f2833",
    borderColor: "#45a29e",
    marginVertical: 2.5
  },
  submitBtn: {
    marginBottom: 5,
    borderColor: "#66fcf1",
    borderRadius: 0,
    borderWidth: 2,
    marginHorizontal: 2.5,
    alignSelf: "stretch"
  },
  registerView: {
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginTop: 35,
    borderColor: "#1f2833"
  },
  signInView: {
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginTop: 125,
    borderColor: "#1f2833"
  },
  headerTxt: {
    fontSize: 35,
    // fontWeight: "bold",
    fontFamily: "space-mono-bold",
    color: "#66fcf1"
  },
  btnContainer: {
    flex: 1,
    alignSelf: "stretch"
  }
});
