import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  AsyncStorage
} from "react-native";
import {
  Header,
  List,
  ListItem,
  Overlay,
  Icon,
  Button,
  Avatar
} from "react-native-elements";
import { ImagePicker } from "expo";
import { onSignOut } from "../auth";
import axios from "axios";
import { apiUrl } from "../config";

export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: "Settings"
  };

  constructor(props) {
    super(props);

    this.state = {
      token: "",
      user: null,
      pickedImage: null,
      profileSettingsVisible: false,
      profilePictureModalVisible: false,
      avatarMessage: "",
      buttonhidden: false
    };
  }

  async componentDidMount() {
    const token = await AsyncStorage.getItem("jwt");
    const response = await axios.get(`${apiUrl}/user`, {
      headers: {
        Authorization: token
      }
    });

    this.setState({ user: response.data.user, token });
  }

  logout = () => {
    onSignOut().then(() => this.props.navigation.navigate("SignedOut"));
  };

  toggleProfileSettings = () => {
    this.setState({
      profileSettingsVisible: !this.state.profileSettingsVisible,
      buttonhidden: !this.state.buttonhidden
    });
  };

  toggleUpdateAvatar = () => {
    this.setState({
      profilePictureModalVisible: !this.state.profilePictureModalVisible,
      avatarMessage: "",
      pickedImage: null,
      buttonhidden: !this.state.buttonhidden
    });
  };

  handleUpload = async () => {
    const uriParts = this.state.pickedImage.uri.split(".");
    const fileType = uriParts[uriParts.length - 1];

    const formData = new FormData();
    formData.append("avatar", {
      uri: this.state.pickedImage.uri,
      name: `${this.state.user._id}.${fileType}`,
      type: `image/${fileType}`
    });

    try {
      const response = await axios.post(`${apiUrl}/upload`, formData, {
        headers: {
          Authorization: this.state.token,
          "Content-Type": "application/json"
        }
      });
      if (response.data.success) {
        this.setState({
          avatarMessage: response.data.message,
          pickedImage: null
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  pickImage = async () => {
    const pickedImage = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true
    });

    if (pickedImage.cancelled) {
      return;
    }

    this.setState({ pickedImage });
  };

  takePhoto = async () => {
    const pickedImage = await ImagePicker.launchCameraAsync({
      allowsEditing: true
    });

    if (pickedImage.cancelled) {
      return;
    }

    this.setState({ pickedImage });
  };

  render() {
    return (
      <View style={styles.container}>
        <Header
          outerContainerStyles={{
            height: "8%",
            paddingBottom: 5,
            marginBottom: 5
          }}
          centerComponent={
            <Text style={{ color: "white", fontSize: 24 }}>Settings</Text>
          }
        />
        <List containerStyle={{ marginTop: 0 }}>
          <ListItem
            leftIcon={{ type: "font-awesome", name: "user" }}
            title="My Profile Settings"
            onPressRightIcon={this.toggleProfileSettings}
          />
          <ListItem
            leftIcon={{ type: "font-awesome", name: "user-circle" }}
            title="Update Profile Picture"
            onPressRightIcon={this.toggleUpdateAvatar}
          />
        </List>

        {this.state.profileSettingsVisible && (
          <Overlay isVisible fullScreen={true}>
            <View>
              <Header
                backgroundColor="white"
                outerContainerStyles={{
                  height: "25%",
                  paddingVertical: 5,
                  marginBottom: 5
                }}
                leftComponent={
                  <Text style={{ color: "gray", fontSize: 20 }}>
                    Profile Settings
                  </Text>
                }
                rightComponent={
                  <Icon
                    color="gray"
                    size={24}
                    type="entypo"
                    name="cross"
                    onPress={this.toggleProfileSettings}
                  />
                }
              />
            </View>
          </Overlay>
        )}

        {this.state.profilePictureModalVisible && (
          <Overlay isVisible fullScreen={true}>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Header
                backgroundColor="white"
                outerContainerStyles={{
                  height: "12%",
                  paddingVertical: 5,
                  width: "100%",
                  marginBottom: 10
                }}
                leftComponent={
                  <Text style={{ color: "gray", fontSize: 20 }}>
                    Upload Profile Picture
                  </Text>
                }
                rightComponent={
                  <Icon
                    color="gray"
                    size={24}
                    type="entypo"
                    name="cross"
                    onPress={this.toggleUpdateAvatar}
                  />
                }
              />
              {!this.state.pickedImage && (
                <View
                  style={{ justifyContent: "center", alignItems: "center" }}
                >
                  <Avatar
                    rounded
                    xlarge
                    source={{ uri: this.state.user.avatarUrl }}
                  />

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      marginVertical: 10
                    }}
                  >
                    <Button
                      text="Open Gallery"
                      buttonStyle={{ marginRight: 5 }}
                      onPress={this.pickImage}
                    />
                    <Button
                      text="Open Camera"
                      buttonStyle={{ marginLeft: 5 }}
                      onPress={this.takePhoto}
                    />
                  </View>
                </View>
              )}

              <View>
                {this.state.pickedImage && (
                  <View
                    style={{
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center"
                    }}
                  >
                    <Avatar
                      xlarge
                      rounded
                      source={{ uri: this.state.pickedImage.uri }}
                    />
                    <Text>Update profile picture?</Text>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        marginTop: 5
                      }}
                    >
                      <Button
                        buttonStyle={{ marginRight: 5 }}
                        text="No"
                        onPress={() => this.setState({ pickedImage: null })}
                      />
                      <Button
                        buttonStyle={{ marginLeft: 5 }}
                        text="Yes"
                        onPress={this.handleUpload}
                      />
                    </View>
                  </View>
                )}
                {!!this.state.avatarMessage && (
                  <View>
                    <Text>{this.state.avatarMessage}</Text>
                  </View>
                )}
              </View>
            </View>
          </Overlay>
        )}

        {!this.state.buttonhidden && (
          <View>
            <Button
              buttonStyle={{ marginTop: 5 }}
              text="Logout"
              onPress={this.logout}
            />
          </View>
        )}
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
