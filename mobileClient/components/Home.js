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
import { localip } from 'react-native-dotenv';


export default class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: ""
    };
  }

  // Example of how to access backend and pass the jwt in headers
  async componentDidMount() {
    const token = await AsyncStorage.getItem("jwt");
    axios
      .get(`http://${localip}:3000/user`, {
        headers: {
          Authorization: token
        }
      })
      .then(response => {
        const user = response.data.user;
        this.setState({ username: user.username });
      })
      .catch(error => {
        console.log(error);
      });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Home</Text>
        <Text>
          {this.state.username && this.state.username.length
            ? this.state.username
            : null}
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
  }
});
