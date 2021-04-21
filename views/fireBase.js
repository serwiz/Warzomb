var app_fireBase = {};
(function() {
  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  var firebaseConfig = {
    apiKey: "AIzaSyADBnISxgd2ws_QOie5NHmTt134nUSutII",
    authDomain: "aws-warzomb.firebaseapp.com",
    projectId: "aws-warzomb",
    storageBucket: "aws-warzomb.appspot.com",
    messagingSenderId: "666755337191",
    appId: "1:666755337191:web:7325085ec6b134ca394b42",
    measurementId: "G-T278G1L0YW"
  };
  // Initialize Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  app_fireBase = firebase;
})();
