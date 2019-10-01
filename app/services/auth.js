function AuthService($rootScope) {
  var lock = new Auth0Lock("", "", {
    auth: {
      redirect: false,
      params: {
        scope: "openid email profile"
      }
    },
    autoclose: true,
    rememberLastLogin: false
  });
  var userProfile = JSON.parse(localStorage.getItem("profile")) || {};

  return {
    getUserProfile: getUserProfile,
    login: login,
    logout: logout,
    registerAuthenticationListener: registerAuthenticationListener,
    resetUserAuthentication: resetUserAuthentication
  };

  function getUserProfile() {
    return userProfile;
  }

  function login() {
    lock.show();
  }

  // Logging out just requires removing the user's
  // id_token and profile
  function logout() {
    resetUserAuthentication();
  }

  // Set up the logic for when a user authenticates
  // This method is called from auth.module.js
  function registerAuthenticationListener() {
    lock.on("authenticated", function(authResult) {
      localStorage.setItem("id_token", authResult.idToken);
      localStorage.setItem("accessToken", authResult.accessToken);

      authManager.authenticate();

      lock.getUserInfo(authResult.accessToken, function(error, profile) {
        if (error) {
          console.log(error);
          return;
        }

        localStorage.setItem("profile", JSON.stringify(profile));
        setUserProfile(profile);
        $rootScope.$broadcast("userProfileSet", profile);
      });
    });
  }

  function resetUserAuthentication() {
    localStorage.removeItem("id_token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("profile");
    authManager.unauthenticate();
    userProfile = {};
  }

  function setUserProfile(profile) {
    userProfile = profile;
  }
}

angular.module("auth", []).service("AuthService", AuthService);
