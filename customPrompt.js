import prompt from "react-native-prompt-android";

export const customPrompt = () => {
  return new Promise((resolve, reject) => {
    prompt(
      "Enter QVcode",
      "Enter QVcode to test it against server result",
      [
        {
          text: "Cancel",
          onPress: () => reject("Cancel Pressed"),
          style: "cancel",
        },
        { text: "OK", onPress: (qvcode) => resolve(qvcode) },
      ],
      {
        cancelable: false,
        defaultValue: "",
        placeholder: "Enter qvcode here",
      }
    );
  });
};
