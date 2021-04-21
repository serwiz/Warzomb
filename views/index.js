var mainApp = {};
var co_tag = document.getElementById("right_co");
var deco_tag = document.getElementById("right_deco");
var profile_tag = document.getElementById("profile");
var resume_tag = document.getElementById("resume");
(function() {
  var firebase = app_fireBase;
  var uid = null;
  /**
   * Firebase Function, Watcher to keep track of a user status
   * @param {FirebaseUser object} user - object with data on a user, null if user is not connected
   */
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
      co_tag.style.display = "none";
      deco_tag.style.display = "block";
      profile_tag.style.display = "block";
      resume_tag.style.display = "block";

      // User is signed in.
      uid = user.uid;
    } else {
      // user is not connected, then redirect to login page

      deco_tag.style.display = "none";
      co_tag.style.display = "block";
      profile_tag.style.display = "none";
      resume_tag.style.display = "none";

      if (uid) window.location.replace("index.html");
      uid = null;
    }

    /**
     * function to call the FireBase function SignOut(). Disconnect the user.
     */
    function logOut() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          // Sign-out successful.
          console.log("Sign out success");
        })
        .catch(error => {
          // An error happened.
          console.log(error.message);
        });
    }

    mainApp.logOut = logOut;
  });
})();
