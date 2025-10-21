// React
import { useMemo, useEffect } from 'react'
import {
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { useLDClient } from "launchdarkly-react-client-sdk";
import { FullStory } from '@fullstory/browser';
import { setUser } from '@sentry/react';

import { LoginRoute, PrivateRoute } from 'v2/routing/routers'
import useRoutes from 'v2/routing/useRoutes'
import { authCheck } from 'v2/routing/authCheck'
import MainMenu from "v2/components/MainMenu";
import LoginV2 from 'v2/screens/login/index.js';
import usePartnerDocument from 'v2/hooks/usePartner';
import useCurrentUser from 'v2/hooks/useCurrentUser';

export const App = () => {
  const ld = useLDClient();
  const routes = useRoutes();
  const { user, loading: userLoading } = useCurrentUser();
  const { document: partner } = usePartnerDocument();
  
  const authd = useMemo(() => {
    if (userLoading || !user) {
      return false;
    }
    return authCheck(user);
  }, [user, userLoading]);

  useEffect(() => {
    if (!authd || !partner) {
      return;
    }

    document.title = `Jia - ${partner.name}`;

    ld.identify({
      kind: 'multi',
      user: {
        key: user.id,
        name: user.username,
      },
      partner: {
        key: partner.uuid,
        name: partner.name,
      },
    });

    window.Appcues?.identify(user.username);

    FullStory('setIdentity', {
      uid: user.uid,
      properties: {
        name: user.name,
        username: user.username,
        partner: partner.name,
      },
    });

    setUser({
      id: user.uid,
      username: user.username,
      partner: partner.name,
    });
  }, [authd, ld, user, partner]);

  return (
    <div className='App' style={{
      minHeight: '100vh',
      backgroundColor: 'rgb(19, 22, 26)'
    }}>
      { authd && <MainMenu offsetHeader /> }
      <Routes>
        {routes.map(route => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <PrivateRoute
                user={user}
                loading={userLoading}
                component={route.component}
              />
            }
          />
        ))}

        <Route
          path="/login"
            element={
              <LoginRoute user={user} loading={userLoading}>
                <LoginV2 />
              </LoginRoute>
            }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}
