export const getUIErrorFromFirebaseError = (
  firebaseErrorCode: string,
  context?: "login" | "password-change"
) => {
  switch (firebaseErrorCode) {
    case "auth/email-already-in-use":
      return "An account with this email address is already registered";
    case "auth/invalid-credential":
    case "auth/wrong-password":
      if (context === "password-change") {
        return "Current password is incorrect";
      }
      return "Incorrect email or password";
    case "auth/weak-password":
      return "Password should be at least 8 characters";
    case "auth/requires-recent-login":
      return "Please log out and log back in before changing your password";
    default:
      return "An error occurred";
  }
};
