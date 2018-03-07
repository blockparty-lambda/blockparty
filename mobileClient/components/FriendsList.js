import React from "react";
import {
  StyleSheet,
  View,
  SectionList,
  AsyncStorage,
  ActivityIndicator,
  Alert,
  Keyboard
} from "react-native";
import axios from "axios";
import { apiUrl } from "../config";
import {
  Header,
  List,
  ListItem,
  SearchBar,
  Button,
  Text,
  Overlay,
  Input,
  Icon,
  Avatar,
  ButtonGroup
} from "react-native-elements";
import { Select, Option } from "react-native-chooser";

export default class FriendsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token: "",
      query: "",
      transactionAmount: "",
      reason: "",
      selectedCoin: "",
      coinLabel: "Select a Currency",
      acceptedFriends: [],
      requestedFriends: [],
      pendingFriends: [],
      searchResults: [],
      refreshing: false,
      loading: false,
      sendModalVisible: false,
      requestModalVisible: false,
      sendRequestModalVisible: false,
      selectedFriend: null
    };
  }

  // call our api to get the users apis
  // set result to state
  async componentDidMount() {
    this.setState({ token: await AsyncStorage.getItem("jwt") });
    this.getFriendData();
  }

  getFriendData = async () => {
    this.setState({ loading: true });

    axios
      .get(`${apiUrl}/getfriends`, {
        headers: {
          Authorization: this.state.token
        }
      })
      .then(response => {
        const {
          acceptedFriends,
          pendingFriends,
          requestedFriends
        } = response.data.friends.reduce(
          (result, friend) =>
            friend.status === "accepted"
              ? (result.acceptedFriends.push(friend), result)
              : friend.status === "pending"
                ? (result.pendingFriends.push(friend), result)
                : friend.status === "requested"
                  ? (result.requestedFriends.push(friend), result)
                  : result,
          { acceptedFriends: [], pendingFriends: [], requestedFriends: [] }
        );

        this.setState({
          acceptedFriends,
          pendingFriends,
          requestedFriends,
          loading: false,
          refreshing: false,
          searchResults: []
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  acceptFriendRequest = async friend => {
    await axios.post(
      `${apiUrl}/addfriend`,
      { friendId: friend._id },
      {
        headers: {
          Authorization: this.state.token,
          "Content-Type": "application/json"
        }
      }
    );

    this.getFriendData();
  };

  rejectFriendRequest = async friend => {
    await axios.post(
      `${apiUrl}/removefriend`,
      { friendId: friend._id },
      {
        headers: {
          Authorization: this.state.token,
          "Content-Type": "application/json"
        }
      }
    );

    this.getFriendData();
  };

  handleRefresh = () => {
    this.setState(
      {
        refreshing: true
      },
      () => {
        this.getFriendData();
      }
    );
  };

  handleSearch = async () => {
    const query = this.state.query;
    try {
      if (query === "") {
        return this.setState({ searchResults: [] });
      }
      const results = await axios.get(`${apiUrl}/partialusers?query=${query}`, {
        headers: { Authorization: this.state.token }
      });

      this.setState({ searchResults: results.data.users });
    } catch (error) {
      console.log(error);
    }
  };

  renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: "86%",
          backgroundColor: "#45a29e",
          marginLeft: "14%"
        }}
      />
    );
  };

  renderHeader = () => {
    return (
      <SearchBar
        placeholder="Search friends..."
        onSubmitEditing={this.handleSearch}
        autoCapitalize="none"
        autoCorrect={false}
        containerStyle={{ backgroundColor: "#0b0c10" }}
        inputStyle={{ backgroundColor: "#1f2833" }}
        value={this.state.query}
        onChangeText={text => {
          this.setState({ query: text }, () => {
            this.handleSearch();
          });
        }}
        onClearText={this.getFriendData}
        clearIcon
        round
      />
    );
  };

  renderFooter = () => {
    if (!this.state.loading) return null;

    return (
      <View
        style={{
          paddingVertical: 20,
          borderTopWidth: 1,
          borderColor: "#45a29e"
        }}
      >
        <ActivityIndicator animating size="large" />
      </View>
    );
  };

  renderSectionSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: "100%",
          backgroundColor: "#45a29e"
        }}
      />
    );
  };

  handleFriendClick = friend => {
    this.setState({ selectedFriend: friend, sendRequestModalVisible: true });
  };

  handleToSendClick = () => {
    this.setState({
      sendModalVisible: true,
      sendRequestModalVisible: false
    });
  };

  handleToRequestClick = () => {
    this.setState({
      requestModalVisible: true,
      sendRequestModalVisible: false
    });
  };

  handleCancel = () => {
    this.setState({
      selectedFriend: null,
      requestModalVisible: false,
      sendModalVisible: false,
      sendRequestModalVisible: false,
      coinLabel: "Select a Currency",
      selectedCoin: "",
      transactionAmount: "",
      reason: ""
    });
  };

  updateIndex = idx => {
    this.setState({ selectedIndex: idx });
  };

  handleSend = async () => {
    // const selectedCoin = ["eth", "btc", "eth_test", "btc_test"];

    const transaction = await axios.post(
      `${apiUrl}/send`,
      {
        friendId: this.state.selectedFriend._id,
        coin: this.state.selectedCoin,
        amount: this.state.transactionAmount,
        subject: this.state.reason
      },
      {
        headers: {
          Authorization: this.state.token,
          "Content-Type": "application/json"
        }
      }
    );

    if (transaction.data.success) {
      Alert.alert("Transaction Sent", `Transaction Sent Successfully`, [
        { text: "OK", onPress: this.handleCancel }
      ]);
    } else {
      if (transaction.data.error.error === "insufficient funds") {
        Alert.alert("Transaction Failed", "Insufficient funds", [
          { text: "OK", onPress: this.handleCancel }
        ]);
      }
    }
  };

  handleROF = async () => {
    // const selectedCoin = ["eth", "btc", "eth_test", "btc_test"];

    const transaction = await axios.post(
      `${apiUrl}/requestfunds`,
      {
        receiver: this.state.selectedFriend._id,
        coin: this.state.selectedCoin,
        amount: this.state.transactionAmount,
        subject: this.state.reason
      },
      {
        headers: {
          Authorization: this.state.token,
          "Content-Type": "application/json"
        }
      }
    );

    if (transaction.data.success) {
      Alert.alert("Request Sent", `${transaction.data.message}`, [
        { text: "OK", onPress: this.handleCancel }
      ]);
    } else {
      Alert.alert("Transaction Failed", transaction.data.message, [
        { text: "OK", onPress: this.handleCancel }
      ]);
    }
  };

  onSelect = (value, label) => {
    this.setState({ selectedCoin: value, coinLabel: label });
  };

  render() {
    const buttons = ["Eth", "Btc", "Eth Test", "Btc Test"];
    return (
      <List
        containerStyle={{
          borderTopWidth: 0,
          borderBottomWidth: 0,
          height: "100%",
          backgroundColor: "#0b0c10"
        }}
      >
        <SectionList
          keyExtractor={item => item._id}
          ItemSeparatorComponent={this.renderSeparator}
          SectionSeparatorComponent={this.renderSectionSeparator}
          ListHeaderComponent={this.renderHeader}
          ListFooterComponent={this.renderFooter}
          onRefresh={this.handleRefresh}
          refreshing={this.state.refreshing}
          extraData={this.state}
          renderSectionHeader={({ section }) => {
            if (!section.data.length) return null;
            return (
              <View style={{ backgroundColor: "#1f2833" }}>
                <Text
                  // h4
                  style={{
                    marginLeft: 15,
                    marginVertical: 5,
                    fontSize: 26,
                    fontFamily: "space-mono-regular",
                    color: "#66fcf1"
                  }}
                >
                  {section.key}
                </Text>
              </View>
            );
          }}
          sections={[
            {
              data: this.state.searchResults,
              key: "Search Results",
              renderItem: ({ item }) => {
                return (
                  <ListItem
                    roundAvatar
                    title={
                      <View style={{ marginLeft: 15 }}>
                        <Text style={styles.itemTitle}>{item.username}</Text>
                      </View>
                    }
                    avatar={{ uri: item.avatarUrl }}
                    containerStyle={{ borderBottomWidth: 0 }}
                    rightIcon={{
                      type: "entypo",
                      name: "add-user",
                      color: "#66fcf1"
                    }}
                    onPress={() => {
                      this.acceptFriendRequest(item);
                    }}
                  />
                );
              }
            },
            {
              data: this.state.pendingFriends,
              key: "Friend Requests",
              renderItem: ({ item }) => {
                return (
                  <ListItem
                    roundAvatar
                    title={
                      <View style={{ marginLeft: 15 }}>
                        <Text style={styles.itemTitle}>
                          {item.friend.username}
                        </Text>
                      </View>
                    }
                    subtitle="Accept Friend Request?"
                    subtitleStyle={{ marginLeft: 15 }}
                    avatar={{ uri: item.friend.avatarUrl }}
                    containerStyle={{ borderBottomWidth: 0 }}
                    rightIcon={
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "center"
                        }}
                      >
                        <Button
                          clear
                          textStyle={{ color: "#fc6670" }}
                          buttonStyle={styles.cancelBtn}
                          text="No"
                          onPress={() => this.rejectFriendRequest(item)}
                        />
                        <Button
                          clear
                          textStyle={{ color: "#66fcf1" }}
                          text="Yes"
                          buttonStyle={styles.sendBtn}
                          containerStyle={{ marginLeft: 2 }}
                          onPress={() => this.acceptFriendRequest(item)}
                        />
                      </View>
                    }
                  />
                );
              }
            },
            {
              data: this.state.requestedFriends,
              key: "Sent Friend Requests",
              renderItem: ({ item }) => {
                return (
                  <ListItem
                    roundAvatar
                    title={
                      <View style={{ marginLeft: 15 }}>
                        <Text style={styles.itemTitle}>
                          {item.friend.username}
                        </Text>
                      </View>
                    }
                    avatar={{ uri: item.friend.avatarUrl }}
                    containerStyle={{ borderBottomWidth: 0 }}
                    rightIcon={
                      <Button
                        clear
                        textStyle={{ color: "#fc6670" }}
                        buttonStyle={styles.cancelBtn}
                        text="Cancel"
                        onPress={() => this.rejectFriendRequest(item)}
                      />
                    }
                  />
                );
              }
            },
            {
              data: this.state.acceptedFriends,
              key: "Friends",
              renderItem: ({ item }) => {
                return (
                  <ListItem
                    roundAvatar
                    title={
                      <View style={{ marginLeft: 15 }}>
                        <Text style={styles.itemTitle}>
                          {item.friend.username}
                        </Text>
                      </View>
                    }
                    chevronColor="#66fcf1"
                    underlayColor="#45a29e"
                    avatar={{ uri: item.friend.avatarUrl }}
                    containerStyle={{ borderBottomWidth: 0 }}
                    onPress={() => this.handleFriendClick(item.friend)}
                  />
                );
              }
            }
          ]}
        />

        {/* send or request funds modal */}
        {this.state.sendRequestModalVisible &&
          this.state.selectedFriend && (
            <Overlay isVisible height="auto" overlayBackgroundColor="#0b0c10">
              <View>
                <Header
                  backgroundColor="#0b0c10"
                  outerContainerStyles={{ borderBottomColor: "#45a29e" }}
                  centerComponent={
                    <Text
                      style={{
                        color: "#66fcf1",
                        fontSize: 24,
                        fontFamily: "space-mono-regular"
                      }}
                    >
                      {this.state.selectedFriend.username}
                    </Text>
                  }
                  leftComponent={
                    <Avatar
                      medium
                      rounded
                      source={{ uri: this.state.selectedFriend.avatarUrl }}
                    />
                  }
                />
                <View style={styles.modalColumn}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginTop: 5
                    }}
                  >
                    <Button
                      text="Send"
                      clear
                      textStyle={{
                        color: "#66fcf1",
                        fontFamily: "space-mono-bold"
                      }}
                      buttonStyle={styles.sendBtn}
                      containerStyle={styles.btnContainer}
                      onPress={this.handleToSendClick}
                    />
                    <Button
                      text="Request"
                      clear
                      textStyle={{
                        color: "#66bbfc",
                        fontFamily: "space-mono-bold"
                      }}
                      buttonStyle={styles.requestBtn}
                      containerStyle={styles.btnContainer}
                      onPress={this.handleToRequestClick}
                    />
                    <Button
                      text="Cancel"
                      clear
                      textStyle={{
                        color: "#fc6670",
                        fontFamily: "space-mono-bold"
                      }}
                      buttonStyle={styles.cancelBtn}
                      containerStyle={styles.btnContainer}
                      onPress={this.handleCancel}
                    />
                  </View>
                </View>
              </View>
            </Overlay>
          )}

        {/* request money modal */}
        {this.state.requestModalVisible &&
          this.state.selectedFriend && (
            <Overlay
              isVisible
              height="auto"
              width="auto"
              overlayBackgroundColor="#0b0c10"
            >
              <View>
                <Header
                  backgroundColor="#0b0c10"
                  outerContainerStyles={{ borderBottomColor: "#45a29e" }}
                  centerComponent={
                    <Text
                      style={{
                        color: "#66fcf1",
                        fontSize: 24,
                        fontFamily: "space-mono-regular"
                      }}
                    >
                      {this.state.selectedFriend.username}
                    </Text>
                  }
                  leftComponent={
                    <Avatar
                      medium
                      rounded
                      source={{ uri: this.state.selectedFriend.avatarUrl }}
                    />
                  }
                />
                <View style={styles.modalColumn}>
                  <Input
                    placeholder="amount..."
                    placeholderTextColor="#c5c6c7"
                    value={this.state.transactionAmount}
                    inputStyle={styles.textInput}
                    containerStyle={styles.textInputContainer}
                    keyboardType="numeric"
                    returnKeyType="done"
                    onChangeText={text =>
                      this.setState({ transactionAmount: text })
                    }
                  />
                  <Input
                    placeholder="What's it for?"
                    placeholderTextColor="#c5c6c7"
                    inputStyle={styles.textInput}
                    containerStyle={styles.textInputContainer}
                    value={this.state.reason}
                    onChangeText={text => this.setState({ reason: text })}
                  />
                  <View>
                    <Select
                      defaultText={this.state.coinLabel}
                      optionListStyle={{ backgroundColor: "#1f2833" }}
                      style={{
                        borderColor: "#45a29e",
                        width: 265,
                        marginVertical: 5
                      }}
                      textStyle={{ color: "#45a29e" }}
                      transparent
                      indicator="down"
                      indicatorColor="#45a29e"
                      onSelect={this.onSelect}
                    >
                      <Option value="eth" styleText={styles.optionTxt}>
                        Ether
                      </Option>
                      <Option value="eth_test" styleText={styles.optionTxt}>
                        Ether Test
                      </Option>
                      <Option value="btc" styleText={styles.optionTxt}>
                        Bitcoin
                      </Option>
                      <Option value="btc_test" styleText={styles.optionTxt}>
                        Bitcoin Test
                      </Option>
                    </Select>
                  </View>
                  <View style={styles.confirmBtns}>
                    <Button
                      text="Request"
                      buttonStyle={styles.requestBtn}
                      clear
                      textStyle={{
                        color: "#66bbfc",
                        fontFamily: "space-mono-bold"
                      }}
                      containerStyle={styles.btnContainer}
                      onPress={() => {
                        Alert.alert("Confirm Request", null, [
                          {
                            text: "NO",
                            onPress: this.handleCancel,
                            style: "cancel"
                          },
                          { text: "YES", onPress: this.handleROF }
                        ]);
                      }}
                    />
                    <Button
                      buttonStyle={styles.cancelBtn}
                      text="Cancel"
                      clear
                      textStyle={{
                        color: "#fc6670",
                        fontFamily: "space-mono-bold"
                      }}
                      containerStyle={styles.btnContainer}
                      onPress={this.handleCancel}
                    />
                  </View>
                </View>
              </View>
            </Overlay>
          )}

        {/* send money modal */}
        {this.state.sendModalVisible &&
          this.state.selectedFriend && (
            <Overlay isVisible height="auto" overlayBackgroundColor="#0b0c10">
              <View>
                <Header
                  backgroundColor="#0b0c10"
                  outerContainerStyles={{ borderBottomColor: "#45a29e" }}
                  centerComponent={
                    <Text
                      style={{
                        color: "#66fcf1",
                        fontSize: 24,
                        fontFamily: "space-mono-regular"
                      }}
                    >
                      {this.state.selectedFriend.username}
                    </Text>
                  }
                  leftComponent={
                    <Avatar
                      medium
                      rounded
                      source={{ uri: this.state.selectedFriend.avatarUrl }}
                    />
                  }
                />
                <View style={styles.modalColumn}>
                  <Input
                    placeholder="amount..."
                    value={this.state.transactionAmount}
                    inputStyle={styles.textInput}
                    containerStyle={styles.textInputContainer}
                    placeholderTextColor="#c5c6c7"
                    keyboardType="numeric"
                    onChangeText={text =>
                      this.setState({ transactionAmount: text })
                    }
                  />
                  <Input
                    placeholder="What's it for?"
                    inputStyle={styles.textInput}
                    containerStyle={styles.textInputContainer}
                    placeholderTextColor="#c5c6c7"
                    value={this.state.reason}
                    onChangeText={text => this.setState({ reason: text })}
                  />
                  <View>
                    <Select
                      defaultText={this.state.coinLabel}
                      optionListStyle={{ backgroundColor: "#1f2833" }}
                      style={{
                        borderColor: "#45a29e",
                        width: 265,
                        marginVertical: 5
                      }}
                      textStyle={{ color: "#45a29e" }}
                      transparent
                      indicator="down"
                      indicatorColor="#45a29e"
                      onSelect={this.onSelect}
                    >
                      <Option value="eth" styleText={styles.optionTxt}>
                        Ether
                      </Option>
                      <Option value="eth_test" styleText={styles.optionTxt}>
                        Ether Test
                      </Option>
                      <Option value="btc" styleText={styles.optionTxt}>
                        Bitcoin
                      </Option>
                      <Option value="btc_test" styleText={styles.optionTxt}>
                        Bitcoin Test
                      </Option>
                    </Select>
                  </View>
                  <View style={styles.confirmBtns}>
                    <Button
                      text="Send"
                      buttonStyle={styles.sendBtn}
                      containerStyle={styles.btnContainer}
                      clear
                      textStyle={{
                        color: "#66fcf1",
                        fontFamily: "space-mono-bold"
                      }}
                      onPress={() => {
                        Alert.alert("Confirm Transaction", null, [
                          {
                            text: "NO",
                            onPress: this.handleCancel,
                            style: "cancel"
                          },
                          { text: "YES", onPress: this.handleSend }
                        ]);
                      }}
                    />
                    <Button
                      buttonStyle={styles.cancelBtn}
                      clear
                      containerStyle={styles.btnContainer}
                      text="Cancel"
                      textStyle={{
                        color: "#fc6670",
                        fontFamily: "space-mono-bold"
                      }}
                      onPress={this.handleCancel}
                    />
                  </View>
                </View>
              </View>
            </Overlay>
          )}
      </List>
    );
  }
}

const styles = StyleSheet.create({
  modalColumn: {
    flexDirection: "column",
    marginVertical: 15
  },
  coinBtns: {
    height: 35,
    marginTop: 15,
    borderRadius: 0,
    borderWidth: 0,
    paddingBottom: 5,
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: "#45a29e"
  },
  confirmBtns: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 15
  },
  cancelBtn: {
    borderColor: "#fc6670",
    borderBottomWidth: 2,
    alignSelf: "stretch",
    borderRadius: 0
  },
  sendBtn: {
    borderColor: "#66fcf1",
    borderBottomWidth: 2,
    alignSelf: "stretch",
    borderRadius: 0
  },
  requestBtn: {
    borderColor: "#66bbfc",
    borderBottomWidth: 2,
    alignSelf: "stretch",
    borderRadius: 0
  },
  btnContainer: {
    flex: 1,
    alignSelf: "stretch"
  },
  itemTitle: {
    fontFamily: "space-mono-regular",
    fontSize: 20,
    color: "#66fcf1"
  },
  textInput: {
    height: 35,
    borderColor: "transparent",
    color: "#45a29e",
    width: 300,
    marginVertical: 5
  },
  textInputContainer: {
    // backgroundColor: "#1f2833",
    borderColor: "#45a29e",
    marginVertical: 2.5
  },
  optionTxt: {
    color: "#45a29e",
    fontFamily: "space-mono-regular"
  }
});
