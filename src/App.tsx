import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AssistantDashboard } from './components/AssistantDashboard';
import { CalendarProvider } from './context/CalendarContext';
import { TravelProvider } from './context/TravelContext';
import { EmailProvider } from './context/EmailContext';
import { AIProvider } from './context/AIContext';
import { LoginView } from './components/LoginView';
import { useCalendar } from './context/CalendarContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function AppContent() {
  const { user, login } = useCalendar();

  if (!user) {
    return <LoginView onLoginSuccess={login} />;
  }

  return <AssistantDashboard />;
}

function App() {
  if (!GOOGLE_CLIENT_ID) {
    console.warn("VITE_GOOGLE_CLIENT_ID is missing in .env file. Real Google Login will not work.");
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <CalendarProvider>
        <EmailProvider>
          <TravelProvider>
            <AIProvider>
              <AppContent />
            </AIProvider>
          </TravelProvider>
        </EmailProvider>
      </CalendarProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
