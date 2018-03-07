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

    this.setState({ token });

    this.getUserProfile();
  }

  getUserProfile = async () => {
    const response = await axios.get(`${apiUrl}/user`, {
      headers: {
        Authorization: this.state.token
      }
    });

    this.setState({ user: response.data.user });
  };

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
        this.setState(
          {
            avatarMessage: response.data.message,
            pickedImage: null
          },
          () => this.getUserProfile()
        );
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
            backgroundColor: "#1f2833",
            borderBottomColor: "#45a29e"
          }}
          style={{ borderBottomColor: "#45a29e" }}
          leftComponent={
            <Text
              style={{
                color: "#66fcf1",
                fontSize: 24,
                fontFamily: "space-mono-bold"
              }}
            >
              Settings
            </Text>
          }
        />
        <List
          containerStyle={{
            marginTop: 0,
            backgroundColor: "#0b0c10",
            borderTopColor: "#45a29e"
          }}
        >
          <ListItem
            leftIcon={{ type: "font-awesome", name: "user", color: "#45a29e" }}
            wrapperStyle={{ borderBottomColor: "#45a29e" }}
            containerStyle={{ borderBottomColor: "#45a29e" }}
            titleStyle={styles.itemTitle}
            title="My Profile Settings"
            chevronColor="#66fcf1"
            onPress={this.toggleProfileSettings}
          />
          <ListItem
            titleStyle={{
              color: "#66fcf1",
              marginLeft: 8,
              fontSize: 20,
              fontFamily: "space-mono-bold"
            }}
            containerStyle={{ borderBottomColor: "#45a29e" }}
            wrapperStyle={{ borderBottomColor: "#45a29e" }}
            leftIcon={{
              type: "font-awesome",
              name: "user-circle",
              size: 22,
              color: "#45a29e"
            }}
            chevronColor="#66fcf1"
            title="Update Profile Picture"
            onPress={this.toggleUpdateAvatar}
          />
        </List>

        {this.state.profileSettingsVisible && (
          <Overlay isVisible fullScreen={true} overlayBackgroundColor="#0b0c10">
            <View>
              <Header
                outerContainerStyles={{
                  // height: "12%",
                  paddingVertical: 5,
                  width: "100%",
                  marginBottom: 10,
                  backgroundColor: "#0b0c10",
                  borderBottomColor: "#45a29e"
                }}
                style={{ borderBottomColor: "#45a29e" }}
                leftComponent={
                  <Text
                    style={{
                      color: "#45a29e",
                      fontSize: 20,
                      fontFamily: "space-mono-bold"
                    }}
                  >
                    Profile Settings
                  </Text>
                }
                rightComponent={
                  <Icon
                    color="#fc6670"
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
          <Overlay isVisible fullScreen={true} overlayBackgroundColor="#0b0c10">
            <View
              style={{
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Header
                outerContainerStyles={{
                  // height: "12%",
                  paddingVertical: 5,
                  width: "100%",
                  marginBottom: 15,
                  // backgroundColor: "#1f2833",
                  backgroundColor: "#0b0c10",
                  borderBottomColor: "#45a29e"
                }}
                leftComponent={
                  <Text style={{ color: "#45a29e", fontSize: 20 }}>
                    Upload Profile Picture
                  </Text>
                }
                rightComponent={
                  <Icon
                    color="#fc6670"
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
                      clear
                      textStyle={{ color: "#66fcf1" }}
                      buttonStyle={{
                        marginRight: 5,
                        borderColor: "#66fcf1",
                        borderRadius: 0,
                        borderBottomWidth: 2
                      }}
                      onPress={this.pickImage}
                    />
                    <Button
                      text="Open Camera"
                      clear
                      textStyle={{ color: "#66fcf1" }}
                      buttonStyle={{
                        marginLeft: 5,
                        borderColor: "#66fcf1",
                        borderRadius: 0,
                        borderBottomWidth: 2
                      }}
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
                    <Text style={{ marginTop: 10, color: "#45a29e" }}>
                      Update profile picture?
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        marginTop: 10
                      }}
                    >
                      <Button
                        buttonStyle={{
                          marginRight: 5,
                          borderColor: "#fc6670",
                          borderBottomWidth: 2,
                          borderRadius: 0,
                          width: 70
                        }}
                        textStyle={{ color: "#fc6670" }}
                        text="No"
                        clear
                        onPress={() => this.setState({ pickedImage: null })}
                      />
                      <Button
                        buttonStyle={{
                          marginLeft: 5,
                          borderColor: "#66fcf1",
                          borderBottomWidth: 2,
                          borderRadius: 0,
                          width: 70
                        }}
                        clear
                        text="Yes"
                        textStyle={{ color: "#66fcf1" }}
                        onPress={this.handleUpload}
                      />
                    </View>
                  </View>
                )}
                {!!this.state.avatarMessage && (
                  <View>
                    <Text style={{ color: "#45a29e" }}>
                      {this.state.avatarMessage}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Overlay>
        )}

        {!this.state.buttonhidden && (
          <View style={{ alignSelf: "stretch", justifyContent: "center" }}>
            <Button
              clear
              textStyle={{ color: "#fc6670", fontFamily: "space-mono-bold" }}
              buttonStyle={{
                marginTop: 15,
                borderColor: "#fc6670",
                borderRadius: 0,
                borderBottomWidth: 2
              }}
              text="Log Out"
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
    backgroundColor: "#0b0c10"
  },
  itemTitle: {
    color: "#66fcf1",
    marginLeft: 15,
    fontSize: 20,
    fontFamily: "space-mono-bold"
  }
});
