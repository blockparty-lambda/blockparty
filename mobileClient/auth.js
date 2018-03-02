import { AsyncStorage } from "react-native";

export const onSignIn = async (token, username) => {
  await AsyncStorage.setItem("jwt", token);
  await AsyncStorage.setItem("bpUsername", username);
}

export const onSignOut = () => {
  AsyncStorage.removeItem("jwt");
  AsyncStorage.removeItem("bpUsername");
}

export const isSignedIn = () => {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem("jwt")
      .then(res => {
        if (res !== null) {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .catch(err => reject(err));
  });
};
