import React from "react";
import { StyleSheet, Text, View, TextInput, Button } from "react-native";
import axios from "axios";
import { localip } from 'react-native-dotenv';

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

  register() {
    axios
      .post(`http://${localip}:3000/register`, {
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
      <View style={styles.container}>
        <Text>Register</Text>
        <Text>
          {this.state.error && this.state.error.length
            ? this.state.error
            : null}
        </Text>
        <TextInput
          style={styles.textInput}
          onChangeText={email => this.setState({ email })}
          value={this.state.email}
          placeholder="email"
        />
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
        <TextInput
          style={styles.textInput}
          onChangeText={passwordRepeat => this.setState({ passwordRepeat })}
          value={this.state.passwordRepeat}
          placeholder="repeat password"
          secureTextEntry={true}
        />
        <Button title={"Submit"} onPress={this.register} />

        <Text
          onPress={() => this.props.navigation.navigate("SignIn")}
          style={styles.registerSignInHereText}
        >
          Already Registered?
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
    // fontFamily: "sans-serif",
    fontSize: 20,
    fontWeight: "bold"
  }
});
