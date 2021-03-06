import React, { useState } from "react";
import { Grid, Snackbar, Hidden } from "@material-ui/core";
import { connect } from "react-redux";
import { History } from "history";
import axios from "axios";

import actions from "redux/actions/auth";
import "./loginPage.scss";

import LoginLogo from './components/LoginLogo';
import GoogleButton from "./components/GoogleButton";
import PolicyDialog from 'components/baseComponents/policyDialog/PolicyDialog';
import RegisterButton from "./components/RegisterButton";
import DesktopLoginForm from "./components/DesktopLoginForm";
import WrongLoginDialog from "./components/WrongLoginDialog";
import MobileLoginPage from "./MobileLogin";

const mapDispatch = (dispatch: any) => ({
  loginSuccess: () => dispatch(actions.loginSuccess()),
});

const connector = connect(null, mapDispatch);

export enum LoginState {
  ChooseLoginAnimation,
  ChooseLogin,
  ButtonsAnimation,
  Login
}

interface LoginProps {
  loginSuccess(): void;
  history: History;
  match: any;
}

const LoginPage: React.FC<LoginProps> = (props) => {
  let initPolicyOpen = false;
  if (props.match.params.privacy && props.match.params.privacy === "privacy-policy") {
    initPolicyOpen = true;
  }
  const [alertMessage, setAlertMessage] = useState("");
  const [alertShown, toggleAlertMessage] = useState(false);
  const [passwordHidden, setHidden] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPolicyOpen, setPolicyDialog] = React.useState(initPolicyOpen);
  const [loginState, setLoginState] = React.useState(LoginState.ChooseLoginAnimation);
  const [isLoginWrong, setLoginWrong] = React.useState(false);

  const moveToLogin = () => {
    setLoginState(LoginState.ButtonsAnimation);
    setTimeout(() => {
      setLoginState(LoginState.Login);
    }, 450);
  }

  const validateForm = () => {
    if (email.length > 0 && password.length > 0) {
      return true;
    }
    return "Fill required fields";
  };

  function handleLoginSubmit(event: any) {
    event.preventDefault();

    let res = validateForm();
    if (res !== true) {
      toggleAlertMessage(true);
      setAlertMessage(res);
      return;
    }

    login(email, password);
  }

  const login = (email: string, password: string) => {
    axios.post(
      `${process.env.REACT_APP_BACKEND_HOST}/auth/login/3`,
      { email, password, userType: 3 },
      { withCredentials: true }
    ).then((response) => {
      const { data } = response;
      if (data === "OK") {
        props.loginSuccess();
        return;
      }
      let { msg } = data;
      if (!msg) {
        const { errors } = data;
        msg = errors[0].msg;
      }
      toggleAlertMessage(true);
      setAlertMessage(msg);
    }).catch((error) => {
      const { response } = error;
      if (response) {
        if (response.status === 500) {
          toggleAlertMessage(true);
          setAlertMessage("Server error");
        } else if (response.status === 401) {
          const { msg } = response.data;
          if (msg === "USER_IS_NOT_ACTIVE") {
            //props.history.push("/sign-up-success");
          } else if (msg === "INVALID_EMAIL_OR_PASSWORD") {
            setLoginWrong(true);
          }
        }
      } else {
        toggleAlertMessage(true);
        setAlertMessage("Connection problem");
      }
    });
  };

  const register = (email: string, password: string) => {
    axios.post(
      `${process.env.REACT_APP_BACKEND_HOST}/auth/SignUp/3`,
      { email, password, confirmPassword: password },
      { withCredentials: true }
    ).then((resp) => {
      const { data } = resp;

      if (data.errors) {
        toggleAlertMessage(true);
        setAlertMessage(data.errors[0].msg);
        return;
      }

      if (data.msg) {
        toggleAlertMessage(true);
        setAlertMessage(data.msg);
      }

      if (data === "OK") {
        login(email, password);
      }
    }).catch((e) => {
      toggleAlertMessage(true);
      setAlertMessage("Connection problem");
    });
  };

  const renderButtons = () => {
    let className = 'button-box f-column';
    if (loginState === LoginState.ButtonsAnimation) {
      className += ' expanding';
    }
    return (
      <div className={className}>
        <RegisterButton onClick={moveToLogin} />
        <GoogleButton />
      </div>
    );
  }

  return (
    <Grid
      className="auth-page login-page"
      container
      item
      justify="center"
      alignItems="center"
    >
      <Hidden only={["xs"]}>
        <div className="choose-login-desktop">
          <Grid container direction="row" className="first-row">
            <div className="first-col"></div>
            <div className="second-col"></div>
            <div className="third-col"></div>
          </Grid>
          <Grid container direction="row" className="second-row">
            <div className="first-col">
              <LoginLogo />
            </div>
            <div className="second-col">
              {loginState === LoginState.Login ?
                <DesktopLoginForm
                  loginState={loginState}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  passwordHidden={passwordHidden}
                  setHidden={setHidden}
                  handleSubmit={handleLoginSubmit}
                  register={() => register(email, password)}
                />
                :
                renderButtons()
              }
            </div>
          </Grid>
          <Grid container direction="row" className="third-row">
            <div className="first-col"></div>
            <div className="second-col">
              <span className="policy-text" onClick={() => setPolicyDialog(true)}>Privacy Policy</span>
            </div>
            <div className="third-col"></div>
          </Grid>
        </div>
      </Hidden>
      <MobileLoginPage
        email={email}
        password={password}
        passwordHidden={passwordHidden}
        loginState={loginState}
        history={props.history}
        match={props.match}
        moveToLogin={moveToLogin}
        loginSuccess={props.loginSuccess}
        setEmail={setEmail}
        setPassword={setPassword}
        setHidden={setHidden}
        register={register}
        login={login}
        handleLoginSubmit={handleLoginSubmit}
        setPolicyDialog={setPolicyDialog}
        setLoginState={setLoginState}
      />
      <WrongLoginDialog isOpen={isLoginWrong} submit={() => register(email, password)} close={() => setLoginWrong(false)} />
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={alertShown}
        autoHideDuration={1500}
        onClose={() => toggleAlertMessage(false)}
        message={alertMessage}
        action={<React.Fragment></React.Fragment>}
      />
      <PolicyDialog isOpen={isPolicyOpen} close={() => setPolicyDialog(false)} />
    </Grid>
  );
};

export default connector(LoginPage);
