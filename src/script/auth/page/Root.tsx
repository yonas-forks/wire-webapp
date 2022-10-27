/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

import React, {useEffect} from 'react';

import {pathWithParams} from '@wireapp/commons/lib/util/UrlUtil';
import {ContainerXS, Loading, StyledApp, THEME_ID} from '@wireapp/react-ui-kit';
import {IntlProvider} from 'react-intl';
import {connect} from 'react-redux';
import {HashRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import {AnyAction, Dispatch} from 'redux';

import {t} from 'Util/LocalizerUtil';

import {CheckPassword} from './CheckPassword';
import {ClientManager} from './ClientManager';
import {ConversationJoin} from './ConversationJoin';
import {ConversationJoinInvalid} from './ConversationJoinInvalid';
import {CreateAccount} from './CreateAccount';
import {CreatePersonalAccount} from './CreatePersonalAccount';
import {CustomEnvironmentRedirect} from './CustomEnvironmentRedirect';
import {HistoryInfo} from './HistoryInfo';
import {Index} from './Index';
import {InitialInvite} from './InitialInvite';
import {Login} from './Login';
import {PhoneLogin} from './PhoneLogin';
import {SetAccountType} from './SetAccountType';
import {SetEmail} from './SetEmail';
import {SetEntropyPage} from './SetEntropyPage';
import {SetHandle} from './SetHandle';
import {SetPassword} from './SetPassword';
import {SingleSignOn} from './SingleSignOn';
import {TeamName} from './TeamName';
import {VerifyEmailCode} from './VerifyEmailCode';
import {VerifyEmailLink} from './VerifyEmailLink';
import {VerifyPhoneCode} from './VerifyPhoneCode';

import {Config} from '../../Config';
import {mapLanguage, normalizeLanguage} from '../localeConfig';
import {actionRoot as ROOT_ACTIONS} from '../module/action/';
import {bindActionCreators, RootState} from '../module/reducer';
import * as AuthSelector from '../module/selector/AuthSelector';
import * as CookieSelector from '../module/selector/CookieSelector';
import * as LanguageSelector from '../module/selector/LanguageSelector';
import {ROUTE} from '../route';

interface RootProps {}

const Title: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return <>{children}</>;
};

const RootComponent: React.FC<RootProps & ConnectedProps & DispatchProps> = ({
  isAuthenticated,
  language,
  isFetchingSSOSettings,
  startPolling,
  safelyRemoveCookie,
  stopPolling,
  doGetSSOSettings,
}) => {
  useEffect(() => {
    // Force the hash url to have a initial `/` (see https://stackoverflow.com/a/71864506)
    const forceSlashAfterHash = () => {
      const hash = window.location.hash;
      if (!hash.startsWith('#/')) {
        window.location.hash = `#/${hash.slice(1)}`;
      }
    };

    forceSlashAfterHash();

    window.addEventListener('hashchange', forceSlashAfterHash);
    return () => {
      window.removeEventListener('hashchange', forceSlashAfterHash);
    };
  }, []);

  useEffect(() => {
    startPolling();
    window.onbeforeunload = () => {
      safelyRemoveCookie(CookieSelector.COOKIE_NAME_APP_OPENED, Config.getConfig().APP_INSTANCE_ID);
      stopPolling();
    };
  }, []);

  useEffect(() => {
    doGetSSOSettings();
  }, []);

  const loadLanguage = (language: string) => {
    return require(`I18n/${mapLanguage(language)}.json`);
  };

  const navigate = (route: string): null => {
    window.location.assign(pathWithParams(route));
    return null;
  };

  const isAuthenticatedCheck = (page: any): any => (page ? (isAuthenticated ? page : navigate('/auth')) : null);

  const ProtectedHistoryInfo = () => isAuthenticatedCheck(<HistoryInfo />);
  const ProtectedInitialInvite = () => isAuthenticatedCheck(<InitialInvite />);
  const ProtectedClientManager = () => isAuthenticatedCheck(<ClientManager />);

  const ProtectedSetHandle = () => isAuthenticatedCheck(<SetHandle />);
  const ProtectedSetEmail = () => isAuthenticatedCheck(<SetEmail />);
  const ProtectedSetPassword = () => isAuthenticatedCheck(<SetPassword />);

  const brandName = Config.getConfig().BRAND_NAME;
  return (
    <IntlProvider locale={normalizeLanguage(language)} messages={loadLanguage(language)}>
      <StyledApp themeId={THEME_ID.DEFAULT} style={{display: 'flex', height: '100%', minHeight: '100vh'}}>
        {isFetchingSSOSettings ? (
          <ContainerXS centerText verticalCenter style={{justifyContent: 'center'}}>
            <Loading />
          </ContainerXS>
        ) : (
          <Router>
            <Routes>
              <Route
                path={ROUTE.INDEX}
                element={
                  <Title title={`${t('authLandingPageTitleP1')} ${brandName} . ${t('authLandingPageTitleP2')}`}>
                    <Index />
                  </Title>
                }
              />
              <Route path={ROUTE.CHECK_PASSWORD} element={<CheckPassword />} />
              <Route path={ROUTE.CLIENTS} element={<ProtectedClientManager />} />
              <Route path={ROUTE.CONVERSATION_JOIN_INVALID} element={<ConversationJoinInvalid />} />
              <Route path={ROUTE.CONVERSATION_JOIN} element={<ConversationJoin />} />
              {Config.getConfig().FEATURE.ENABLE_ACCOUNT_REGISTRATION && (
                <Route path={ROUTE.CREATE_TEAM} element={<TeamName />} />
              )}
              <Route path={ROUTE.HISTORY_INFO} element={<ProtectedHistoryInfo />} />
              <Route path={ROUTE.INITIAL_INVITE} element={<ProtectedInitialInvite />} />
              <Route
                path={`${ROUTE.LOGIN}/*`}
                element={
                  <Title title={`${t('authLoginTitle')} . ${brandName}`}>
                    <Login />
                  </Title>
                }
              />
              <Route path={ROUTE.LOGIN_PHONE} element={<PhoneLogin />} />
              <Route
                path={ROUTE.SET_ACCOUNT_TYPE}
                element={
                  <Title title={`${t('authAccCreationTitle')} . ${brandName}`}>
                    <SetAccountType />
                  </Title>
                }
              />
              <Route path={ROUTE.SET_EMAIL} element={<ProtectedSetEmail />} />
              <Route path={ROUTE.SET_HANDLE} element={<ProtectedSetHandle />} />
              <Route
                path={ROUTE.SET_PASSWORD}
                element={
                  <Title title={`${t('authForgotPasswordTitle')} . ${brandName}`}>
                    <ProtectedSetPassword />
                  </Title>
                }
              />
              <Route path={`${ROUTE.SSO}`}>
                <Route
                  path=""
                  element={
                    <Title title={`${t('authSSOLoginTitle')} . ${brandName}`}>
                      <SingleSignOn />
                    </Title>
                  }
                />
                <Route
                  path=":code"
                  element={
                    <Title title={`${t('authSSOLoginTitle')} . ${brandName}`}>
                      <SingleSignOn />
                    </Title>
                  }
                />
              </Route>
              <Route path={ROUTE.VERIFY_EMAIL_LINK} element={<VerifyEmailLink />} />
              <Route path={ROUTE.VERIFY_PHONE_CODE} element={<VerifyPhoneCode />} />
              <Route path={ROUTE.CUSTOM_ENV_REDIRECT} element={<CustomEnvironmentRedirect />} />
              {Config.getConfig().FEATURE.ENABLE_EXTRA_CLIENT_ENTROPY && (
                <Route path={ROUTE.SET_ENTROPY} element={<SetEntropyPage />} />
              )}
              {Config.getConfig().FEATURE.ENABLE_ACCOUNT_REGISTRATION && (
                <Route path={ROUTE.VERIFY_EMAIL_CODE} element={<VerifyEmailCode />} />
              )}
              {Config.getConfig().FEATURE.ENABLE_ACCOUNT_REGISTRATION && (
                <Route path={ROUTE.CREATE_ACCOUNT} element={<CreatePersonalAccount />} />
              )}
              {Config.getConfig().FEATURE.ENABLE_ACCOUNT_REGISTRATION && (
                <Route path={ROUTE.CREATE_TEAM_ACCOUNT} element={<CreateAccount />} />
              )}
              <Route path="*" element={<Navigate to={ROUTE.INDEX} replace />} />
            </Routes>
          </Router>
        )}
      </StyledApp>
    </IntlProvider>
  );
};

type ConnectedProps = ReturnType<typeof mapStateToProps>;
const mapStateToProps = (state: RootState) => ({
  isAuthenticated: AuthSelector.isAuthenticated(state),
  isFetchingSSOSettings: AuthSelector.isFetchingSSOSettings(state),
  language: LanguageSelector.getLanguage(state),
});

type DispatchProps = ReturnType<typeof mapDispatchToProps>;
const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
  bindActionCreators(
    {
      doGetSSOSettings: ROOT_ACTIONS.authAction.doGetSSOSettings,
      safelyRemoveCookie: ROOT_ACTIONS.cookieAction.safelyRemoveCookie,
      startPolling: ROOT_ACTIONS.cookieAction.startPolling,
      stopPolling: ROOT_ACTIONS.cookieAction.stopPolling,
    },
    dispatch,
  );

const Root = connect(mapStateToProps, mapDispatchToProps)(RootComponent);

export {Root};
