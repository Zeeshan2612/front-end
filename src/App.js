import React, {useState, useCallback, useEffect, Suspense} from 'react';
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import Users from './user/pages/Users';
// import NewPlaces from './places/pages/NewPlaces';
import MainNavigation from './shared/components/Navigation/MainNavigation';
// import UserPlaces from './places/pages/UserPlaces';
// import UpdatePlaces from './places/pages/UpdatePlaces';
import Auth from './user/pages/Auth';
import { AuthContext } from './shared/context/auth-context';
import LoadingSpinner from './shared/components/UIElements/LoadingSpinner';


// const Users = React.lazy(() => import('./user/pages/Users'));
const NewPlaces = React.lazy(() => import('./places/pages/NewPlaces'));
const UserPlaces = React.lazy(() => import('./places/pages/UserPlaces'));
const UpdatePlaces = React.lazy(() => import('./places/pages/UpdatePlaces'));
// const Auth = React.lazy(() => import('./user/pages/Auth'));

let logoutTimer;

function App() {

  const [token, setToken] = useState(false);
  const [userId, setUserId] = useState(false);
  const [tokenExpirationDate, setTokenExpirationDate] = useState();

  const login = useCallback( (uId, token, expirationDate) => {
    setUserId(uId);
    setToken(token);
    const tokenExpirationDate = expirationDate || new Date(new Date().getTime() + 1000*60*60);
    setTokenExpirationDate(tokenExpirationDate);
    localStorage.setItem('userData', JSON.stringify({
      userId: uId,
      token: token,
      expiration: tokenExpirationDate.toISOString()
    }));
  }, []);

  const logout = useCallback( () => {
    setUserId(null);
    setToken(null);
    setTokenExpirationDate(null);
    localStorage.removeItem('userData');
  }, []);

  useEffect(() =>{
    if(token && tokenExpirationDate){
      const remainingTime = tokenExpirationDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime);
    }
    else{
      clearTimeout(logoutTimer);
    }
  },[token, logout, tokenExpirationDate])

  useEffect(() =>{
    const storedData = JSON.parse(localStorage.getItem('userData'));
    if(storedData && storedData.token && new Date(storedData.expiration) > new Date()){
      login(storedData.userId, storedData.token, new Date(storedData.expiration));
    }
  }, [login]);

  let routes;

  if(token){
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:creatorId/places" exact>
              <UserPlaces />
            </Route>
        <Route path="/places/new">
          <NewPlaces />
        </Route>
        <Route path="/places/:placeId" exact>
          <UpdatePlaces />
        </Route>
        <Redirect to="/" />
        </Switch>
    );
  }
  else{
    routes = (
      <Switch>
        <Route path="/" exact>
          <Users />
        </Route>
        <Route path="/:creatorId/places" exact>
              <UserPlaces />
        </Route>
        <Route path="/auth" exact>
          <Auth />
        </Route>
        <Redirect to="/auth" />
       </Switch>
    );
  }

  return (
    <AuthContext.Provider value={{
      isLoggedIn: !!token,
      token: token, 
      login: login,
      userId: userId, 
      logout: logout}}>

      <Router>
        <MainNavigation />
        <main>
          <Suspense
            fallback={
              <div className="center">
                <LoadingSpinner />
              </div>
            }
          >
            {routes}
          </Suspense>
        </main>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;